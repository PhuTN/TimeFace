import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useUIFactory } from "../ui/factory/useUIFactory";
import HeaderBar from "../components/common/HeaderBar.tsx";
import GradientButton from "../components/common/GradientButton";
import { RootStackParamList } from "../navigation/AppNavigator";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path as SvgPath } from "react-native-svg";
import { Camera } from "react-native-vision-camera";
import { useFaceDetectionHandle, FaceDetectionStep } from "../utils/FaceDetectionHandle";
// === THÊM IMPORT CỦA SKIA ===
import {
  Canvas,
  Path as SkiaPath,
  Skia,
  LinearGradient, // Skia có component LinearGradient riêng
  vec,
  PathOp
} from "@shopify/react-native-skia";

type StepKey = FaceDetectionStep;
type StepDefinition = { key: StepKey; label: string };

type Props = NativeStackScreenProps<RootStackParamList, "EmployeeFaceDetection">;

export default function EmployeeFaceDetectionScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  // === ĐỊNH NGHĨA KÍCH THƯỚC OVAL MONG MUỐN ===
  const OVAL_WIDTH = width * 0.8;
  const OVAL_HEIGHT = OVAL_WIDTH * (4.5 / 3);
  const STROKE_WIDTH = 12;

  const RING_GRADIENT = ["#2EF5D2", "#1E4DFF"];
  const BUTTON_GRADIENT = ["#BCD9FF", "#488EEB"];
  const BUTTON_RADIUS = 12;

  const { loading, theme, lang } = useUIFactory();
  const t = lang?.t;

  const steps = useMemo<StepDefinition[]>(
    () => [
      { key: "frame", label: t?.("face_step_put_face_into_frame") ?? "Đưa khuôn mặt vào khung" },
      { key: "smile", label: t?.("face_step_smile") ?? "Hãy mỉm cười" },
      { key: "blink", label: t?.("face_step_blink") ?? "Hãy nháy mắt" },
      { key: "waiting", label: t?.("face_step_waiting") ?? "Chờ nhận diện" },
    ],
    [t]
  );

  const stepMap = useMemo(
    () => steps.reduce<Record<StepKey, StepDefinition>>((acc, s) => { acc[s.key] = s; return acc; }, {} as any),
    [steps]
  );

  const {
    cameraRef,
    device,
    hasPermission,
    permissionStatus,
    isCameraActive,
    isCameraReady,
    frameProcessor,
    handlePutFaceIntoFrame: detectFaceInFrame,
    handleSmile: detectSmile,
    handleBlink: detectBlink,
    refreshPermission,
  } = useFaceDetectionHandle();

  const permissionBlocked = permissionStatus === "denied" || permissionStatus === "restricted";
  const cameraStatusMessage = useMemo(() => {
    if (permissionBlocked) return "Allow camera access in settings to continue.";
    if (!hasPermission) return "Waiting for camera permission...";
    if (!device) return "No compatible camera found.";
    if (!isCameraReady) return "Preparing camera...";
    return "Camera is waking up...";
  }, [device, hasPermission, isCameraReady, permissionBlocked]);

  // Bước hiện tại (mặc định: frame)
  const [currentStep, setCurrentStep] = useState<StepKey>("frame");
  const [flowAttempt, setFlowAttempt] = useState(0);
  const [flowState, setFlowState] = useState<"idle" | "running" | "error" | "done">("idle");
  const [flowError, setFlowError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ⬇️ NEW: lưu thử thách (smile | blink) cho mỗi attempt
  const challengeRef = useRef<"smile" | "blink">("smile");
  const pickChallenge = useCallback(
    () => (Math.random() < 0.5 ? "smile" : "blink"),
    []
  );

  const startFlow = useCallback(() => {
    challengeRef.current = pickChallenge(); // chốt thử thách cho lần chạy này
    setFlowAttempt(prev => prev + 1);
  }, [pickChallenge]);

  const cancelRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(
    (delay = 1600) => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        if (hasPermission && isCameraReady && device) {
          startFlow();
        }
      }, delay);
    },
    [device, hasPermission, isCameraReady, startFlow]
  );

  useEffect(() => () => cancelRetry(), [cancelRetry]);

  const getErrorMessage = useCallback((reason?: string) => {
    switch (reason) {
      case "camera_not_ready":
        return lang?.t('face_camera_not_ready');
      case "face_not_centered":
        return lang?.t('face_face_not_centered');
      case "smile_not_detected":
        return lang?.t('face_smile_not_detected');
      case "blink_not_detected":
        return lang?.t('face_blink_not_detected');
      case "capture_failed":
        return lang?.t('face_capture_failed');
      default:
        return null;
    }
  }, []);

  const handleFlowFailure = useCallback(
    (reason?: string, step?: StepKey, shouldRetry = true) => {
      setFlowState("error");
      const fallbackLabel = step ? stepMap[step]?.label : null;
      setFlowError(getErrorMessage(reason) ?? fallbackLabel ?? null);
      cancelRetry();
      if (shouldRetry) {
        scheduleRetry();
      }
    },
    [getErrorMessage, scheduleRetry, stepMap]
  );

  // ==== 4 hàm handle để bạn thêm logic camera sau ====
  const handlePutFaceIntoFrame = useCallback(() => detectFaceInFrame(), [detectFaceInFrame]);

  const handleSmile = useCallback(() => detectSmile(), [detectSmile]);

  const handleBlink = useCallback(() => detectBlink(), [detectBlink]);

  const handleWaiting = useCallback(() => {
    // Placeholder: future submission logic can use captured frames.
  }, []);
  // ===================================================

  useEffect(() => {
    if (isCameraReady && hasPermission && device && flowAttempt === 0) {
      startFlow();
    }
  }, [device, flowAttempt, hasPermission, isCameraReady, startFlow]);

  useEffect(() => {
    if (!flowAttempt || !isCameraReady || !hasPermission || !device) return;

    let cancelled = false;

    const runFlow = async () => {
      setFlowState("running");
      setFlowError(null);

      // 1) Đưa mặt vào khung
      setCurrentStep("frame");
      const frameResult = await handlePutFaceIntoFrame();
      if (cancelled) return;
      if (!frameResult?.ok) {
        handleFlowFailure(frameResult?.reason, "frame", frameResult?.reason !== "camera_not_ready");
        return;
      }

      // 2) Chọn NGẪU NHIÊN: "smile" hoặc "blink" và CHỈ chạy đúng bước đó
      const which = challengeRef.current;              // "smile" | "blink"
      setCurrentStep(which);

      const result = which === "smile" ? await handleSmile() : await handleBlink();
      if (cancelled) return;
      if (!result?.ok) {
        handleFlowFailure(result?.reason, which);
        return;
      }

      // 3) Waiting / kết thúc
      setCurrentStep("waiting");
      handleWaiting();
      cancelRetry();
      setFlowState("done");
    };

    runFlow();
    return () => {
      cancelled = true;
    };
  }, [
    flowAttempt,
    isCameraReady,
    hasPermission,
    device,
    handleBlink,
    handleFlowFailure,
    handlePutFaceIntoFrame,
    handleSmile,
    handleWaiting,
    cancelRetry,
  ]);

  // === TẠO PATH CHO SKIA ===
  // 1. Path cho nền xám bên trong

  const { innerOvalPath, innerOvalSvgPath, outerOvalPath, dimOutsidePath } = useMemo(() => {
    const innerRect = Skia.XYWHRect(STROKE_WIDTH / 2, STROKE_WIDTH / 2, OVAL_WIDTH - STROKE_WIDTH, OVAL_HEIGHT - STROKE_WIDTH);
    const inner = Skia.Path.Make();
    inner.addOval(innerRect);

    const outerRect = Skia.XYWHRect(STROKE_WIDTH / 2, STROKE_WIDTH / 2, OVAL_WIDTH - STROKE_WIDTH, OVAL_HEIGHT - STROKE_WIDTH);
    const outer = Skia.Path.Make();
    outer.addOval(outerRect);

    // Lớp phủ tối = (hình chữ nhật bao ngoài) - (elip bên trong)
    const fullRect = Skia.Path.Make();
    fullRect.addRect(Skia.XYWHRect(0, 0, OVAL_WIDTH, OVAL_HEIGHT));

    const outside = fullRect.copy();
    outside.op(inner, PathOp.Difference);

    return {
      innerOvalPath: inner,
      innerOvalSvgPath: inner.toSVGString(),
      outerOvalPath: outer,
      dimOutsidePath: outside,
    };
  }, [OVAL_HEIGHT, OVAL_WIDTH, STROKE_WIDTH]);

  // =====================================

  if (loading || !theme || !lang) return null;
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <HeaderBar
          title={lang.t("face_detection_title")}
          onBack={() => navigation?.goBack?.()}
          extra={<View style={{ width: 34 }} />}
        />

        {/* Khung oval (THAY BẰNG SKIA CANVAS) */}
        <View style={styles.faceGuide}>
          <View style={[styles.ovalWrapper, { width: OVAL_WIDTH, height: OVAL_HEIGHT }]}>
            <MaskedView
              style={StyleSheet.absoluteFillObject}
              maskElement={
                <Svg width={OVAL_WIDTH} height={OVAL_HEIGHT}>
                  <SvgPath d={innerOvalSvgPath} fill="#fff" />
                </Svg>
              }
            >
              <View style={styles.cameraSurface}>
                {device && hasPermission ? (
                  <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    device={device}
                    isActive={isCameraActive}
                    photo={true}
                    frameProcessor={frameProcessor}
                  />
                ) : (
                  <View style={styles.cameraFallback}>
                    <Text style={styles.cameraFallbackText}>{cameraStatusMessage}</Text>
                    {!permissionBlocked && (
                      <TouchableOpacity style={styles.cameraFallbackButton} onPress={refreshPermission}>
                        <Text style={styles.cameraFallbackButtonText}>Enable camera</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </MaskedView>

            <Canvas style={[StyleSheet.absoluteFillObject]} pointerEvents="none">
              <SkiaPath path={dimOutsidePath} style="fill" color={theme.colors.background} />
              <SkiaPath path={outerOvalPath} style="stroke" strokeWidth={STROKE_WIDTH}>
                <LinearGradient
                  start={vec(OVAL_WIDTH * 0.1, 0)}
                  end={vec(OVAL_WIDTH * 0.9, OVAL_HEIGHT)}
                  colors={RING_GRADIENT}
                />
              </SkiaPath>
            </Canvas>
          </View>
        </View>
        {/* (Kết thúc khối Skia) */}

        {/* Nút hiển thị như LABEL (không bấm) */}
        {flowError ? (
          <Text style={styles.statusText}>{flowError}</Text>
        ) : flowState === "running" ? (
          <Text style={styles.statusText}>{lang.t('face_status_label')}</Text>
        ) : null}
        {flowState === "error" && (
          <TouchableOpacity style={styles.retryLink} onPress={startFlow}>
            <Text style={styles.retryLinkText}>{lang.t('face_retry_link')}</Text>
          </TouchableOpacity>
        )}
        <View style={{ alignItems: "center", marginBottom: 50 }}>
          <GradientButton
            text={stepMap[currentStep].label}
            onPress={() => {
              if (flowState === "running") return;
              if (!hasPermission) {
                refreshPermission();
                return;
              }
              if (device && isCameraReady) {
                startFlow();
              }
            }}
            colors={BUTTON_GRADIENT}
            borderRadius={BUTTON_RADIUS}
            textColor="#0B1A39"
            style={{ width: "80%" }}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    faceGuide: {
      marginTop: "20%",
      marginBottom: "10%",
      alignItems: "center", // Giữ lại để căn giữa Canvas
      justifyContent: "center",
      width: "100%",

      // Thêm shadow/elevation vào đây nếu bạn muốn
      shadowColor: "#1E4DFF",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 2,
    },

    ovalWrapper: {
      position: "relative",
    },
    cameraSurface: {
      flex: 1,
      backgroundColor: "#0B1A39",
    },
    cameraFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: "#0B1A39",
      gap: 12,
    },
    cameraFallbackText: {
      color: "#ffffff",
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
    },
    cameraFallbackButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#ffffff",
    },
    cameraFallbackButtonText: {
      color: "#ffffff",
      fontWeight: "600",
    },
    statusText: {
      marginTop: 16,
      paddingHorizontal: 24,
      textAlign: "center",
      fontSize: 13,
      color: "#6B7AA1",
    },
    retryLink: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    retryLinkText: {
      color: "#1E4DFF",
      fontWeight: "700",
      alignSelf: "center"
    },
  });
