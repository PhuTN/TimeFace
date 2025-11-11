import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAppState } from "@react-native-community/hooks";
import {
  Camera,
  CameraDevice,
  CameraPermissionStatus,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
import { useFaceDetector, Face } from "react-native-vision-camera-face-detector";
import { Worklets } from 'react-native-worklets-core';

export type FaceDetectionStep = "frame" | "smile" | "blink" | "front" | "left" | "right" | "waiting";
export type ActiveFaceDetectionStep = Exclude<FaceDetectionStep, "waiting">;

export type StepCapture = {
  step: ActiveFaceDetectionStep;
  path: string;
  timestamp: number;
  photo: PhotoFile;
};

export type StepSuccess = {
  ok: true;
  step: ActiveFaceDetectionStep;
  capture: StepCapture;
  /** đường dẫn gốc từ camera */
  filePath: string;
  /** luôn ở dạng file://... */
  uri: string;
};

export type StepFailure = {
  ok: false;
  step: ActiveFaceDetectionStep;
  reason: StepFailureReason;
  capture?: null;
};

export type StepFailureReason =
  | "camera_not_ready"
  | "face_not_centered"
  | "smile_not_detected"
  | "blink_not_detected"
  | "face_not_front"
  | "face_not_left"
  | "face_not_right"
  | "capture_failed";

export type StepResolution = StepSuccess | StepFailure;

export type FaceDetectionFlags = {
  faceInsideFrame: boolean;
  smiling: boolean;
  blinkDetected: boolean;
};

type UseFaceDetectionHandleOptions = {
  /**
   * Called whenever a step finishes with a photo capture.
   */
  onStepCaptured?: (capture: StepCapture) => void;
  /**
   * Allows overriding the camera that should be selected.
   * Defaults to `front`.
   */
  preferredDevice?: "front" | "back";
};

type FramePayload = {
  faces: Face[];
  size: { width: number; height: number };
};

type WaitForConditionConfig = {
  timeout?: number;
  stableDuration?: number;
  pollInterval?: number;
};

const SMILE_THRESHOLD = 0.65;
const BLINK_CLOSE_THRESHOLD = 0.28;
const BLINK_OPEN_THRESHOLD = 0.65;
const BLINK_READY_WINDOW = 1400;
const BLINK_FLAG_HOLD_MS = 900;
const FRONT_YAW_TOLERANCE_DEG = 10;   // |yaw| <= 10° xem như mặt thẳng
const SIDE_YAW_MIN_DEG = 18;          // |yaw| >= 18° xem như nghiêng rõ
const ROLL_TOLERANCE_DEG = 12;        // (tuỳ) hạn chế lật đầu theo trục Z

const clamp01 = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

const initialFlags: FaceDetectionFlags = {
  faceInsideFrame: false,
  smiling: false,
  blinkDetected: false,
};

const usePermissionStatus = () =>
  useState<CameraPermissionStatus>(() => Camera.getCameraPermissionStatus());

const isFaceInsideGuide = (bounds: Face["bounds"], frameSize: FramePayload["size"]) => {
  const { width: frameWidth, height: frameHeight } = frameSize;
  if (frameWidth <= 0 || frameHeight <= 0) return false;

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const normX = cx / frameWidth;
  const normY = cy / frameHeight;
  const normWidth = bounds.width / frameWidth;
  const normHeight = bounds.height / frameHeight;

  const CENTER_TOLERANCE_X = 0.28;
  const CENTER_TOLERANCE_Y = 0.30;
  const WIDTH_RANGE: [number, number] = [0.15, 0.65];
  const HEIGHT_RANGE: [number, number] = [0.18, 0.75];

  const centered =
    Math.abs(normX - 0.5) <= CENTER_TOLERANCE_X &&
    Math.abs(normY - 0.5) <= CENTER_TOLERANCE_Y;
  const correctSize =
    normWidth >= WIDTH_RANGE[0] &&
    normWidth <= WIDTH_RANGE[1] &&
    normHeight >= HEIGHT_RANGE[0] &&
    normHeight <= HEIGHT_RANGE[1];

  return centered && correctSize;
};

export const useFaceDetectionHandle = (options: UseFaceDetectionHandleOptions = {}) => {
  const { onStepCaptured, preferredDevice = "front" } = options;
  const yawRef = useRef(0);
  const rollRef = useRef(0);

  const toFileUri = (p?: string) =>
    !p ? "" : p.startsWith("file://") ? p : `file://${p}`;

  const isMountedRef = useRef(true);
  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const appState = useAppState();
  const isFocused = useIsFocused();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionStatus, setPermissionStatus] = usePermissionStatus();
  const device: CameraDevice | undefined = useCameraDevice(preferredDevice);

  const [autoRequested, setAutoRequested] = useState(false);
  useEffect(() => {
    if (!hasPermission && !autoRequested) {
      setAutoRequested(true);
      requestPermission().then(granted => {
        setPermissionStatus(granted ? "granted" : Camera.getCameraPermissionStatus());
      });
    } else if (hasPermission) {
      setPermissionStatus("granted");
    }
  }, [autoRequested, hasPermission, requestPermission, setPermissionStatus]);

  const cameraRef = useRef<Camera | null>(null);

  const isCameraReady = Boolean(device && hasPermission);
  const isCameraActive = isFocused && appState === "active" && isCameraReady;

  const [flags, setFlags] = useState<FaceDetectionFlags>(initialFlags);
  const flagsRef = useRef<FaceDetectionFlags>(initialFlags);

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast', // Ưu tiên tốc độ cho real-time
    contourMode: 'none',
    landmarkMode: 'none',
    classificationMode: 'all' // BẮT BUỘC để có smilingProbability, eyeOpenProbability
  });

  const mergeFlags = useCallback((patch: Partial<FaceDetectionFlags>) => {
    const current = flagsRef.current;
    let changed = false;
    const next: FaceDetectionFlags = { ...current };

    (Object.keys(patch) as (keyof FaceDetectionFlags)[]).forEach(key => {
      const value = patch[key];
      if (typeof value === "undefined" || value === current[key]) return;
      next[key] = value;
      changed = true;
    });

    if (changed) {
      flagsRef.current = next;
      setFlags(next);
    }
  }, []);

  const faceInsideRef = useRef(false);
  const smileScoreRef = useRef(0);
  const blinkSatisfiedRef = useRef(false);
  const blinkHistoryRef = useRef({
    lastOpen: 0,
    rearmed: false,
    lastBlink: 0,
  });

  const resetDetections = useCallback(() => {
    faceInsideRef.current = false;
    smileScoreRef.current = 0;
    blinkSatisfiedRef.current = false;
    blinkHistoryRef.current = {
      lastOpen: 0,
      rearmed: false,
      lastBlink: 0,
    };
    mergeFlags(initialFlags);
  }, [mergeFlags]);

  const computeBlinkState = useCallback(
    (minEye: number, maxEye: number): boolean => {
      const now = Date.now();
      const history = blinkHistoryRef.current;

      if (maxEye >= BLINK_OPEN_THRESHOLD) {
        history.lastOpen = now;
        history.rearmed = true;
      }

      if (
        minEye <= BLINK_CLOSE_THRESHOLD &&
        history.rearmed &&
        now - history.lastOpen <= BLINK_READY_WINDOW
      ) {
        history.rearmed = false;
        history.lastBlink = now;
        blinkSatisfiedRef.current = true;
        return true;
      }

      if (blinkSatisfiedRef.current && now - history.lastBlink > BLINK_FLAG_HOLD_MS) {
        blinkSatisfiedRef.current = false;
      }

      return blinkSatisfiedRef.current;
    },
    []
  );

  const getYawDeg = (face: Face): number =>
    // MLKit: headEulerAngleY (yaw), một số wrapper dùng yaw / yawAngle
    (face as any).headEulerAngleY ?? (face as any).yaw ?? (face as any).yawAngle ?? 0;

  const getRollDeg = (face: Face): number =>
    (face as any).headEulerAngleZ ?? (face as any).roll ?? (face as any).rollAngle ?? 0;

  const onFacesDetected = useCallback(
    ({ faces, size }: FramePayload) => {
      if (!faces.length) {
        resetDetections();
        return;
      }

      const face = faces[0];
      const inside = isFaceInsideGuide(face.bounds, size);
      faceInsideRef.current = inside;

      const smileScore = clamp01(face.smilingProbability);
      smileScoreRef.current = smileScore;
      const smiling = smileScore >= SMILE_THRESHOLD;

      const leftEye = clamp01(face.leftEyeOpenProbability);
      const rightEye = clamp01(face.rightEyeOpenProbability);
      const minEye = Math.min(leftEye, rightEye);
      const maxEye = Math.max(leftEye, rightEye);
      const blinkDetected = computeBlinkState(minEye, maxEye);
      const yaw = getYawDeg(face);
      const roll = getRollDeg(face);
      yawRef.current = yaw;
      rollRef.current = roll;

      mergeFlags({
        faceInsideFrame: inside,
        smiling,
        blinkDetected,
      });
    },
    [computeBlinkState, mergeFlags, resetDetections]
  );

  const callOnFacesDetectedJS = Worklets.createRunOnJS(onFacesDetected);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const faces = detectFaces(frame);
    callOnFacesDetectedJS({
      faces,
      size: { width: frame.width, height: frame.height },
    });
  }, [detectFaces, callOnFacesDetectedJS]);

  const [captures, setCaptures] = useState<Partial<Record<ActiveFaceDetectionStep, StepCapture>>>({});

  const capturePhotoForStep = useCallback(
    async (step: ActiveFaceDetectionStep): Promise<StepCapture | null> => {
      if (!cameraRef.current || !isCameraReady) return null;

      try {
        const photo = await cameraRef.current.takePhoto({
          flash: "off",
          enableShutterSound: Platform.OS === "android",
        });
        const capture: StepCapture = {
          step,
          path: photo.path,
          timestamp: Date.now(),
          photo,
        };
        setCaptures(prev => {
          const next = { ...prev, [step]: capture };
          return next;
        });
        onStepCaptured?.(capture);
        return capture;
      } catch (error) {
        console.warn(`[FaceDetection] takePhoto(${step}) failed`, error);
        return null;
      }
    },
    [isCameraReady, onStepCaptured]
  );

  const waitForCondition = useCallback(
    async (predicate: () => boolean, config: WaitForConditionConfig = {}) => {
      const { timeout = 9000, stableDuration = 900, pollInterval = 140 } = config;
      const start = Date.now();
      let stableSince: number | null = null;

      while (isMountedRef.current && Date.now() - start <= timeout) {
        if (!predicate()) {
          stableSince = null;
        } else if (stableSince == null) {
          stableSince = Date.now();
        } else if (Date.now() - stableSince >= stableDuration) {
          return true;
        }
        await sleep(pollInterval);
      }
      return false;
    },
    []
  );

  const buildResolution = useCallback(
    (
      ok: boolean,
      step: ActiveFaceDetectionStep,
      reason?: StepFailureReason,
      capture?: StepCapture | null
    ): StepResolution => {
      if (ok && capture) {
        const filePath = capture.path;
        const uri = toFileUri(filePath);
        return {
          ok: true,
          step,
          capture,
          filePath,
          uri,
        };
      }
      return {
        ok: false,
        step,
        reason: (reason ?? "capture_failed") as StepFailureReason,
        capture: null,
      };
    },
    []
  );

  const handlePutFaceIntoFrame = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "frame", "camera_not_ready");

    const ok = await waitForCondition(() => faceInsideRef.current, {
      stableDuration: 1200,
      timeout: 12000,
      pollInterval: 120,
    });

    if (!ok) return buildResolution(false, "frame", "face_not_centered");

    const capture = await capturePhotoForStep("frame");
    return buildResolution(Boolean(capture), "frame", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, waitForCondition]);

  const handleSmile = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "smile", "camera_not_ready");

    const ok = await waitForCondition(() => faceInsideRef.current && smileScoreRef.current >= SMILE_THRESHOLD, {
      stableDuration: 1000,
      timeout: 10000,
      pollInterval: 120,
    });

    if (!ok) return buildResolution(false, "smile", "smile_not_detected");

    const capture = await capturePhotoForStep("smile");
    return buildResolution(Boolean(capture), "smile", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, waitForCondition]);

  const handleBlink = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "blink", "camera_not_ready");

    const ok = await waitForCondition(
      () => faceInsideRef.current && blinkSatisfiedRef.current,
      { stableDuration: 200, timeout: 10000, pollInterval: 80 }
    );

    if (!ok) return buildResolution(false, "blink", "blink_not_detected");

    blinkSatisfiedRef.current = false;
    mergeFlags({ blinkDetected: false });

    const capture = await capturePhotoForStep("blink");
    return buildResolution(Boolean(capture), "blink", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, mergeFlags, waitForCondition]);

  const refreshPermission = useCallback(async () => {
    const granted = await requestPermission();
    setPermissionStatus(granted ? "granted" : Camera.getCameraPermissionStatus());
    return granted;
  }, [requestPermission, setPermissionStatus]);

  const handleFront = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "front", "camera_not_ready");

    const ok = await waitForCondition(
      () =>
        faceInsideRef.current &&
        Math.abs(yawRef.current) <= FRONT_YAW_TOLERANCE_DEG &&
        Math.abs(rollRef.current) <= ROLL_TOLERANCE_DEG,
      { stableDuration: 900, timeout: 12000, pollInterval: 120 }
    );

    if (!ok) return buildResolution(false, "front", "face_not_centered");
    const capture = await capturePhotoForStep("front");
    return buildResolution(Boolean(capture), "front", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, waitForCondition]);

  const handleLeft = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "left", "camera_not_ready");

    const ok = await waitForCondition(
      () =>
        faceInsideRef.current &&
        yawRef.current <= -SIDE_YAW_MIN_DEG &&
        Math.abs(rollRef.current) <= ROLL_TOLERANCE_DEG,
      { stableDuration: 700, timeout: 12000, pollInterval: 120 }
    );

    if (!ok) return buildResolution(false, "left", "face_not_centered");
    const capture = await capturePhotoForStep("left");
    return buildResolution(Boolean(capture), "left", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, waitForCondition]);

  const handleRight = useCallback(async (): Promise<StepResolution> => {
    if (!isCameraReady) return buildResolution(false, "right", "camera_not_ready");

    const ok = await waitForCondition(
      () =>
        faceInsideRef.current &&
        yawRef.current >= SIDE_YAW_MIN_DEG &&
        Math.abs(rollRef.current) <= ROLL_TOLERANCE_DEG,
      { stableDuration: 700, timeout: 12000, pollInterval: 120 }
    );

    if (!ok) return buildResolution(false, "right", "face_not_centered");
    const capture = await capturePhotoForStep("right");
    return buildResolution(Boolean(capture), "right", capture ? undefined : "capture_failed", capture);
  }, [buildResolution, capturePhotoForStep, isCameraReady, waitForCondition]);

  return useMemo(
    () => ({
      cameraRef,
      device,
      hasPermission,
      permissionStatus,
      isCameraActive,
      isCameraReady,
      frameProcessor,
      captures,
      flags,
      handlePutFaceIntoFrame,
      handleSmile,
      handleBlink,
      handleFront,
      handleLeft,
      handleRight,
      refreshPermission,
      onFacesDetected
    }),
    [
      cameraRef,
      captures,
      device,
      flags,
      frameProcessor,
      handleBlink,
      handlePutFaceIntoFrame,
      handleSmile,
      handleFront,
      handleLeft,
      handleRight,
      hasPermission,
      isCameraActive,
      isCameraReady,
      permissionStatus,
      refreshPermission,
      onFacesDetected
    ]
  );
};

export type FaceDetectionHandle = ReturnType<typeof useFaceDetectionHandle>;
