import { useCallback, useEffect, useRef, useState } from "react";
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
import { Worklets } from "react-native-worklets-core";

// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------

export type FaceDetectionStep =
  | "frame"
  | "smile"
  | "blink"
  | "front"
  | "waiting";

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
  filePath: string;
  uri: string;
};

export type StepFailure = {
  ok: false;
  step: ActiveFaceDetectionStep;
  reason: StepFailureReason;
};

export type StepResolution = StepSuccess | StepFailure;

export type StepFailureReason =
  | "camera_not_ready"
  | "face_not_centered"
  | "smile_not_detected"
  | "blink_not_detected"
  | "face_not_front"
  | "capture_failed";

export type FaceDetectionFlags = {
  faceInsideFrame: boolean;
  smiling: boolean;
  blinkDetected: boolean;
};

type FramePayload = {
  faces: Face[];
  size: { width: number; height: number };
};

// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------

const SMILE_THRESHOLD = 0.60;

const BLINK_CLOSE_THRESHOLD = 0.28;
const BLINK_OPEN_THRESHOLD = 0.65;
const BLINK_WINDOW = 1300;
const BLINK_HOLD = 850;

const FRONT_YAW_TOLERANCE_DEG = 12;
const ROLL_TOLERANCE_DEG = 14;

const clamp01 = (n?: number) =>
  typeof n !== "number" || Number.isNaN(n) ? 0 : Math.min(1, Math.max(0, n));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const initialFlags: FaceDetectionFlags = {
  faceInsideFrame: false,
  smiling: false,
  blinkDetected: false,
};

// -------------------------------------------------------------
// FIXED: FRAME ALWAYS TRUE WHEN THERE IS A FACE
// -------------------------------------------------------------

// Chỉ cần MLKit thấy 1 mặt => coi như ở trong khung.
// Không cần bounding box, không cần center, không cần size.
const isFaceInsideGuide = () => true;

// -------------------------------------------------------------
// HOOK
// -------------------------------------------------------------

export const useFaceDetectionHandle = () => {
  const yawRef = useRef(0);
  const rollRef = useRef(0);

  const faceInsideRef = useRef(false);
  const smileRef = useRef(0);
  const blinkRef = useRef(false);

  const blinkHist = useRef({
    lastOpen: 0,
    rearmed: false,
    lastBlink: 0,
  });

  const { hasPermission, requestPermission } = useCameraPermission();
  const device: CameraDevice | undefined = useCameraDevice("front");

  const isFocused = useIsFocused();
  const appState = useAppState();
  const cameraRef = useRef<Camera | null>(null);

  const isCameraReady = Boolean(device && hasPermission);
  const isCameraActive = isFocused && appState === "active" && isCameraReady;

  const [flags, setFlags] = useState(initialFlags);

  const { detectFaces } = useFaceDetector({
    performanceMode: "accurate",
    contourMode: "all",
    landmarkMode: "all",
    classificationMode: "all",
  });

  // MAIN LOOP -----------------------------------------------------

  const onFacesDetected = useCallback(({ faces, size }: FramePayload) => {
    if (!faces.length) {
      faceInsideRef.current = false;
      setFlags(initialFlags);
      return;
    }

    const f = faces[0];

    // ALWAYS TRUE NOW
    faceInsideRef.current = isFaceInsideGuide();

    smileRef.current = clamp01(f.smilingProbability);

    // blink detect
    const left = clamp01(f.leftEyeOpenProbability);
    const right = clamp01(f.rightEyeOpenProbability);

    const min = Math.min(left, right);
    const max = Math.max(left, right);
    const now = Date.now();
    const hist = blinkHist.current;

    if (max >= BLINK_OPEN_THRESHOLD) {
      hist.lastOpen = now;
      hist.rearmed = true;
    }

    if (min <= BLINK_CLOSE_THRESHOLD && hist.rearmed && now - hist.lastOpen <= BLINK_WINDOW) {
      blinkRef.current = true;
      hist.rearmed = false;
      hist.lastBlink = now;
    }

    if (blinkRef.current && now - hist.lastBlink > BLINK_HOLD) {
      blinkRef.current = false;
    }

    yawRef.current = (f as any).headEulerAngleY ?? 0;
    rollRef.current = (f as any).headEulerAngleZ ?? 0;

    setFlags({
      faceInsideFrame: faceInsideRef.current,
      smiling: smileRef.current >= SMILE_THRESHOLD,
      blinkDetected: blinkRef.current,
    });
  }, []);

  const callJS = Worklets.createRunOnJS(onFacesDetected);

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    const faces = detectFaces(frame);
    callJS({ faces, size: { width: frame.width, height: frame.height } });
  }, []);

  // CAPTURE --------------------------------------------------------

  const capture = async (step: ActiveFaceDetectionStep) => {
    if (!cameraRef.current || !isCameraReady) return null;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
        enableShutterSound: Platform.OS === "android",
      });

      return {
        step,
        path: photo.path,
        timestamp: Date.now(),
        photo,
      } as StepCapture;
    } catch {
      return null;
    }
  };

  // WAIT UTILS ----------------------------------------------------

  const wait = async (fn: () => boolean, ms = 350, timeout = 8000) => {
    const start = Date.now();
    let stable: number | null = null;

    while (Date.now() - start < timeout) {
      if (fn()) {
        if (stable == null) stable = Date.now();
        else if (Date.now() - stable >= ms) return true;
      } else {
        stable = null;
      }
      await sleep(120);
    }
    return false;
  };

  // FRONT ---------------------------------------------------------

  const handleFront = async () => {
    if (!isCameraReady)
      return { ok: false, step: "front", reason: "camera_not_ready" };

    const ok = await wait(
      () =>
        faceInsideRef.current &&
        Math.abs(yawRef.current) <= FRONT_YAW_TOLERANCE_DEG &&
        Math.abs(rollRef.current) <= ROLL_TOLERANCE_DEG
    );

    if (!ok)
      return { ok: false, step: "front", reason: "face_not_front" };

    const cap = await capture("front");

    return {
      ok: true,
      step: "front",
      capture: cap!,
      filePath: cap!.path,
      uri: "file://" + cap!.path,
    };
  };

  // SMILE ---------------------------------------------------

  const handleSmile = async () => {
    if (!isCameraReady)
      return { ok: false, step: "smile", reason: "camera_not_ready" };

    const ok = await wait(() => faceInsideRef.current && smileRef.current >= SMILE_THRESHOLD);

    if (!ok)
      return { ok: false, step: "smile", reason: "smile_not_detected" };

    const cap = await capture("smile");

    return {
      ok: true,
      step: "smile",
      capture: cap!,
      filePath: cap!.path,
      uri: "file://" + cap!.path,
    };
  };

  // BLINK ---------------------------------------------------

  const handleBlink = async () => {
    if (!isCameraReady)
      return { ok: false, step: "blink", reason: "camera_not_ready" };

    const ok = await wait(() => faceInsideRef.current && blinkRef.current);

    if (!ok)
      return { ok: false, step: "blink", reason: "blink_not_detected" };

    blinkRef.current = false;

    const cap = await capture("blink");

    return {
      ok: true,
      step: "blink",
      capture: cap!,
      filePath: cap!.path,
      uri: "file://" + cap!.path,
    };
  };

  // FRAME ---------------------------------------------------------

  const handlePutFaceIntoFrame = async () => {
    if (!isCameraReady)
      return { ok: false, step: "frame", reason: "camera_not_ready" };

    const ok = await wait(() => faceInsideRef.current, 400);

    if (!ok)
      return { ok: false, step: "frame", reason: "face_not_centered" };

    const cap = await capture("frame");

    return {
      ok: true,
      step: "frame",
      capture: cap!,
      filePath: cap!.path,
      uri: "file://" + cap!.path,
    };
  };

  return {
    cameraRef,
    device,

    flags,
    frameProcessor,

    isCameraReady,
    isCameraActive,
    hasPermission,
    requestPermission,

    handleFront,
    handleSmile,
    handleBlink,
    handlePutFaceIntoFrame,
  };
};

export type FaceDetectionHandle = ReturnType<typeof useFaceDetectionHandle>;
