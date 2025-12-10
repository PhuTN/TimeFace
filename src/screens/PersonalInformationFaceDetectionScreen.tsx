// 🔥🔥 VERSION FULL – CÓ UPLOAD ẢNH + TRẢ URL VỀ PersonalInformation 🔥🔥

import React, { useEffect, useMemo, useState } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
    Text,
    Image,
} from "react-native";

import HeaderBar from "../components/common/HeaderBar.tsx";
import GradientButton from "../components/common/GradientButton";

import { Camera } from "react-native-vision-camera";
import { useFaceDetectionHandle } from "../utils/FaceDetectionHandle";

import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Path as SvgPath } from "react-native-svg";

import {
    Canvas,
    Path as SkiaPath,
    Skia,
    LinearGradient,
    vec,
    PathOp,
} from "@shopify/react-native-skia";

import ImageResizer from "react-native-image-resizer";
import { uploadSingle } from "../api/uploadApi"; // ⭐ MUST ADD UPLOAD API

export default function PersonalInformationFaceDetectionScreen({ navigation }) {
    const { width } = useWindowDimensions();

    const OVAL_WIDTH = width * 0.8;
    const OVAL_HEIGHT = OVAL_WIDTH * (4.5 / 3);
    const STROKE_WIDTH = 12;

    const steps = [
        { key: "frame", label: "Đưa mặt vào khung" },
        { key: "front", label: "Giữ mặt thẳng" },
        { key: "smile", label: "Mỉm cười nhẹ" },
        { key: "blink", label: "Chớp mắt" },
    ];

    const stepMap = steps.reduce((acc, s) => {
        acc[s.key] = s;
        return acc;
    }, {});

    const {
        cameraRef,
        device,
        hasPermission,
        permissionStatus,
        isCameraActive,
        isCameraReady,
        frameProcessor,

        handlePutFaceIntoFrame,
        handleFront,
        handleSmile,
        handleBlink,
    } = useFaceDetectionHandle();

    const permissionBlocked =
        permissionStatus === "denied" || permissionStatus === "restricted";

    const cameraStatusMessage = useMemo(() => {
        if (permissionBlocked) return "Cần cấp quyền camera để tiếp tục.";
        if (!hasPermission) return "Đang xin quyền camera...";
        if (!device) return "Không tìm thấy camera phù hợp.";
        if (!isCameraReady) return "Đang khởi động camera...";
        return "Camera đang chạy...";
    }, [device, hasPermission, isCameraReady, permissionBlocked]);

    const [currentStep, setCurrentStep] = useState("frame");
    const [flowState, setFlowState] = useState("idle");
    const [flowError, setFlowError] = useState(null);
    const [flowAttempt, setFlowAttempt] = useState(0);

    const addFilePrefix = (u) =>
        /^((file|content|https?):)\/\//.test(u) ? u : `file://${u}`;

    async function rotateImage(uri, degrees = 270) {
        const normalized = addFilePrefix(uri);

        const { width, height } = await new Promise((res) => {
            Image.getSize(normalized, (w, h) => res({ width: w, height: h }), () =>
                res({ width: 1080, height: 1080 })
            );
        });

        const out = await ImageResizer.createResizedImage(
            normalized,
            width,
            height,
            "JPEG",
            100,
            degrees
        );

        return addFilePrefix(out.uri);
    }

    // AUTO START
    useEffect(() => {
        if (isCameraReady && hasPermission && device && flowAttempt === 0) {
            setFlowAttempt(1);
        }
    }, [isCameraReady, hasPermission, device]);

    // FLOW MAIN
    useEffect(() => {
        if (!flowAttempt || !isCameraReady || !hasPermission || !device) return;

        let cancelled = false;

        const runFlow = async () => {
            setFlowState("running");
            setFlowError(null);

            // STEP 1 — FACE IN FRAME
            setCurrentStep("frame");
            const s1 = await handlePutFaceIntoFrame();
            if (!s1.ok) return setFlowError("Không thấy mặt trong khung");

            // STEP 2 — FRONT
            setCurrentStep("front");
            const s2 = await handleFront();
            if (!s2.ok) return setFlowError("Giữ mặt thẳng nha");

            // STEP 3 — SMILE
            setCurrentStep("smile");
            const s3 = await handleSmile();
            if (!s3.ok) return setFlowError("Cười nhẹ thôi!");

            // STEP 4 — BLINK
            setCurrentStep("blink");
            const s4 = await handleBlink();
            if (!s4.ok) return setFlowError("Hãy chớp mắt");

            // FINAL — CAPTURE IMAGE
            const finalFront = await handleFront();

            const rotatedImage = await rotateImage(finalFront.uri, 270);

            // ⭐ UPLOAD TO SERVER
            let uploaded;
            try {
                uploaded = await uploadSingle(rotatedImage, "faces");
                console.log("🔥 Uploaded face:", uploaded.url);
            } catch (err) {
                console.log("❌ Upload error:", err);
                return setFlowError("Upload ảnh thất bại, vui lòng thử lại");
            }

            const finalUrl = uploaded.url;

            if (!cancelled) {
                setFlowState("done");

                setTimeout(() => {
                    navigation.navigate("PersonalInformation", {
                        faces: { image_front: finalUrl },
                    });
                }, 400);
            }
        };

        runFlow();
        return () => (cancelled = true);
    }, [flowAttempt, isCameraReady, hasPermission, device]);

    // MASK
    const { innerOvalSvgPath, dimOutsidePath, outerOvalPath } = useMemo(() => {
        const inner = Skia.Path.Make();
        inner.addOval(
            Skia.XYWHRect(
                STROKE_WIDTH / 2,
                STROKE_WIDTH / 2,
                OVAL_WIDTH - STROKE_WIDTH,
                OVAL_HEIGHT - STROKE_WIDTH
            )
        );

        const full = Skia.Path.Make();
        full.addRect(Skia.XYWHRect(0, 0, OVAL_WIDTH, OVAL_HEIGHT));

        const dim = full.copy();
        dim.op(inner, PathOp.Difference);

        return {
            innerOvalSvgPath: inner.toSVGString(),
            dimOutsidePath: dim,
            outerOvalPath: inner,
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView>

                <HeaderBar title="Xác thực khuôn mặt" onBack={() => navigation.goBack()} />

                <View style={{ marginTop: "20%", alignItems: "center" }}>
                    <View style={{ width: OVAL_WIDTH, height: OVAL_HEIGHT }}>

                        {/* CAMERA MASK */}
                        <MaskedView
                            style={StyleSheet.absoluteFillObject}
                            maskElement={
                                <Svg width={OVAL_WIDTH} height={OVAL_HEIGHT}>
                                    <SvgPath d={innerOvalSvgPath} fill="#fff" />
                                </Svg>
                            }
                        >
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
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ color: "#000" }}>{cameraStatusMessage}</Text>
                                </View>
                            )}
                        </MaskedView>

                        {/* DIM + BORDER */}
                        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
                            <SkiaPath path={dimOutsidePath} style="fill" color="#00000080" />
                            <SkiaPath
                                path={outerOvalPath}
                                style="stroke"
                                strokeWidth={STROKE_WIDTH}
                            >
                                <LinearGradient
                                    start={vec(0, 0)}
                                    end={vec(OVAL_WIDTH, OVAL_HEIGHT)}
                                    colors={["#2EF5D2", "#1E4DFF"]}
                                />
                            </SkiaPath>
                        </Canvas>
                    </View>
                </View>

                {flowError && (
                    <Text style={{ textAlign: "center", marginTop: 20, color: "red" }}>
                        {flowError}
                    </Text>
                )}

                {flowState === "running" && !flowError && (
                    <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
                        Đang xử lý...
                    </Text>
                )}

                <View style={{ alignItems: "center", marginTop: 40 }}>
                    <GradientButton
                        text={stepMap[currentStep]?.label}
                        colors={["#BCD9FF", "#488EEB"]}
                        textColor="#0B1A39"
                        style={{ width: "80%" }}
                        borderRadius={14}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
