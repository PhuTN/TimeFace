import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useUIFactory } from "../ui/factory/useUIFactory";
import HeaderBar from "../components/common/HeaderBar.tsx";
import GradientButton from "../components/common/GradientButton";
import { RootStackParamList } from "../navigation/AppNavigator";

type StepKey = "frame" | "smile" | "blink" | "waiting";
type StepStatus = "pending" | "active" | "completed" | "skipped";
type StepDefinition = { key: StepKey; label: string; helper?: string };

type Props = NativeStackScreenProps<RootStackParamList, "EmployeeFaceDetection">;

// Gradient giống ảnh: xanh ngọc -> xanh dương
const RING_GRADIENT = ["#2EF5D2", "#1E4DFF"];
const BUTTON_GRADIENT = ["#BCD9FF", "#488EEB"];
const BUTTON_RADIUS = 12;

export default function EmployeeFaceDetectionScreen({ navigation }: Props) {
  const { loading, theme, lang } = useUIFactory();
  const [activeStep, setActiveStep] = useState<StepKey>("frame");
  const [completedSteps, setCompletedSteps] = useState<StepKey[]>([]);
  const [skippedStep, setSkippedStep] = useState<StepKey | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const t = lang?.t;
  const stepDefinitions = useMemo<StepDefinition[]>(
    () => [
      {
        key: "frame",
        label: t?.("face_step_put_face_into_frame") ?? "Đưa khuôn mặt vào khung",
        helper:
          t?.("face_step_put_face_hint") ??
          "Canh khuôn mặt của bạn ngay giữa vòng elip để hệ thống ghi nhận.",
      },
      {
        key: "smile",
        label: t?.("face_step_smile") ?? "Hãy mỉm cười",
        helper: t?.("face_step_smile_hint") ?? "Mỉm cười tự nhiên để xác thực chuyển động khuôn mặt.",
      },
      {
        key: "blink",
        label: t?.("face_step_blink") ?? "Hãy nháy mắt",
        helper: t?.("face_step_blink_hint") ?? "Nháy mắt một lần để xác minh bạn là người thật.",
      },
      {
        key: "waiting",
        label: t?.("face_step_waiting") ?? "Chờ xác nhận",
        helper: t?.("face_step_waiting_hint") ?? "Đang chờ hệ thống xác nhận kết quả nhận diện.",
      },
    ],
    [t]
  );

  const stepMap = useMemo(
    () => stepDefinitions.reduce<Record<StepKey, StepDefinition>>((acc, def) => ((acc[def.key] = def), acc), {} as any),
    [stepDefinitions]
  );

  useEffect(() => {
    if (activeStep === "waiting") setStatusMessage(stepMap.waiting?.helper ?? "");
  }, [activeStep, stepMap.waiting?.helper]);

  const runMockDetection = useCallback(async (_step: StepKey) => {
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1200));
  }, []);

  const markStepCompleted = useCallback((step: StepKey) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  const getStepStatus = useCallback(
    (step: StepKey): StepStatus => {
      if (completedSteps.includes(step)) return "completed";
      if (skippedStep === step) return "skipped";
      if (step === activeStep) return "active";
      return "pending";
    },
    [activeStep, completedSteps, skippedStep]
  );

  const statusLabel = useCallback(
    (status: StepStatus) =>
      status === "active"
        ? t?.("face_step_status_active") ?? "Đang thực hiện"
        : status === "completed"
        ? t?.("face_step_status_done") ?? "Hoàn thành"
        : status === "skipped"
        ? t?.("face_step_status_skipped") ?? "Đã bỏ qua"
        : t?.("face_step_status_pending") ?? "Chưa thực hiện",
    [t]
  );

  const handleStepPress = useCallback(
    async (step: StepKey) => {
      const interactive: StepKey[] = ["frame", "smile", "blink"];
      if (isProcessing || step !== activeStep || !interactive.includes(step)) return;

      setIsProcessing(true);
      setStatusMessage(t?.("face_step_detecting") ?? "Đang kiểm tra điều kiện...");

      const success = await runMockDetection(step);
      setIsProcessing(false);

      if (!success) {
        setStatusMessage(t?.("face_step_detect_failed") ?? "Chưa nhận diện được, vui lòng thử lại.");
        return;
      }

      markStepCompleted(step);
      setStatusMessage(t?.("face_step_detect_success") ?? "Hoàn thành điều kiện.");

      if (step === "frame") {
        const next: StepKey = Math.random() > 0.5 ? "smile" : "blink";
        setSkippedStep(next === "smile" ? "blink" : "smile");
        setActiveStep(next);
      } else if (step === "smile" || step === "blink") {
        setActiveStep("waiting");
      }
    },
    [activeStep, isProcessing, t, markStepCompleted, runMockDetection]
  );

  if (loading || !theme || !lang) return null;

  const styles = makeStyles(theme);

  const renderStepButton = (step: StepKey, containerStyle?: any) => {
    const definition = stepMap[step];
    const status = getStepStatus(step);
    const isInteractive = step === "frame" || step === "smile" || step === "blink";
    const isDisabled = step !== activeStep || isProcessing || !isInteractive;
    const shouldDim = (isInteractive && isDisabled) || (!isInteractive && step !== activeStep);

    const onPress = () => {
      if (!isDisabled) handleStepPress(step);
    };

    return (
      <View key={step} style={[styles.stepWrapper, containerStyle]}>
        <GradientButton
          text={definition.label}
          onPress={onPress}
          colors={BUTTON_GRADIENT}
          borderRadius={BUTTON_RADIUS}
          style={[
            styles.stepButton,
            status === "completed" && styles.stepButtonCompleted,
            status === "skipped" && styles.stepButtonSkipped,
            shouldDim && styles.stepButtonDisabled,
          ]}
          textColor="#0B1A39"
        />
        <Text
          style={[
            styles.stepStatus,
            status === "completed" && styles.stepStatusDone,
            status === "skipped" && styles.stepStatusSkipped,
          ]}
        >
          {statusLabel(status)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <HeaderBar
          title={lang.t("face_detection_title")}
          onBack={() => navigation?.goBack?.()}
          extra={<View style={{ width: 34 }} />} // giữ layout như hình
        />

        <View style={styles.screenPad}>
          {/* Card trắng như ảnh */}
          <View style={[styles.card, { backgroundColor: theme.colors.card || "#FFFFFF" }]}>
            {/* Vòng oval gradient */}
            <View style={styles.faceGuide}>
              <LinearGradient
                colors={RING_GRADIENT}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.faceRing}
              >
                <View style={styles.faceInner} />
              </LinearGradient>
            </View>

            {/* Nút chính: Đưa khuôn mặt vào khung */}
            {renderStepButton("frame", styles.primaryStep)}

            {/* Gợi ý / trạng thái */}
            <Text style={[styles.instruction, { color: theme.colors.mutedText || "#5B6C87" }]}>
              {stepMap[activeStep]?.helper ?? stepMap[activeStep]?.label}
            </Text>
            {!!statusMessage && (
              <Text style={[styles.statusMessage, { color: theme.colors.primary || "#3366FF" }]}>
                {statusMessage}
              </Text>
            )}
          </View>

          {/* Các bước phụ giữ lại */}
          <View style={styles.followUpZone}>
            {renderStepButton("smile")}
            {renderStepButton("blink")}
          </View>

          <View style={styles.waitingZone}>{renderStepButton("waiting")}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    screenPad: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    card: {
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 16,
      shadowColor: "#000000",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 3,
      alignItems: "center",
    },

    // --- Vòng oval giống ảnh ---
    faceGuide: {
      marginTop: 8,
      marginBottom: 18,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    faceRing: {
      width: 210,     // đường kính ngang
      height: 270,    // đường kính dọc
      borderRadius: 140,
      padding: 6,     // độ dày viền gradient
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#1E4DFF",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 2,
      backgroundColor: "transparent",
    },
    faceInner: {
      width: 210 - 12,   // trừ 2*padding
      height: 270 - 12,
      borderRadius: 130,
      backgroundColor: "#D9D9D9", // màu xám trong hình
    },

    // --- Nút / status ---
    primaryStep: {
      marginTop: 6,
      marginBottom: 8,
    },
    instruction: {
      marginTop: 6,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    statusMessage: {
      marginTop: 8,
      fontSize: 13,
      textAlign: "center",
      fontWeight: "600",
    },

    // --- Nhóm nút phụ ---
    followUpZone: {
      marginTop: 20,
      gap: 14,
      alignItems: "center",
    },
    waitingZone: {
      marginTop: 28,
      alignItems: "center",
    },

    // --- Button states ---
    stepWrapper: { alignItems: "center" },
    stepButton: { marginTop: 0, width: 260, borderRadius: 12 },
    stepButtonDisabled: { opacity: 0.55 },
    stepButtonCompleted: {
      opacity: 1,
      shadowColor: "#2463D6",
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
    },
    stepButtonSkipped: { opacity: 0.35 },
    stepStatus: { marginTop: 6, fontSize: 12.5, color: "#5B6C87" },
    stepStatusDone: { color: "#1E9E62", fontWeight: "600" },
    stepStatusSkipped: { color: "#A0AEC0", fontStyle: "italic" },
  });
