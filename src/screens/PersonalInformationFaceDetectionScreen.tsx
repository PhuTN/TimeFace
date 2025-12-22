import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUIFactory } from '../ui/factory/useUIFactory';
import HeaderBar from '../components/common/HeaderBar.tsx';
import GradientButton from '../components/common/GradientButton';
import { RootStackParamList } from '../navigation/AppNavigator';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { Camera } from 'react-native-vision-camera';
import {
  useFaceDetectionHandle,
  FaceDetectionStep,
} from '../utils/FaceDetectionHandle';
import { uploadSingle } from '../api/uploadApi';
// === THÊM IMPORT CỦA SKIA ===
import {
  Canvas,
  Path as SkiaPath,
  Skia,
  LinearGradient, // Skia có component LinearGradient riêng
  vec,
  PathOp,
} from '@shopify/react-native-skia';

import Exif from 'react-native-exif';
import ImageResizer from 'react-native-image-resizer';
import { Image } from 'react-native';
import { getFaceIdFromFile, preloadFaceIdModel } from '../utils/face-id-utils.ts';

type StepKey = FaceDetectionStep;
type StepDefinition = { key: StepKey; label: string };

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PersonalInformationFaceDetection'
>;

export default function PersonalInformationFaceDetectionScreen({
  navigation,
}: Props) {
  const { width } = useWindowDimensions();
  // === ĐỊNH NGHĨA KÍCH THƯỚC OVAL MONG MUỐN ===
  const OVAL_WIDTH = width * 0.8;
  const OVAL_HEIGHT = OVAL_WIDTH * (4.5 / 3);
  const STROKE_WIDTH = 12;
  const frontEmbeddingRef = useRef<Float32Array | null>(null);
  const RING_GRADIENT = ['#2EF5D2', '#1E4DFF'];
  const BUTTON_GRADIENT = ['#BCD9FF', '#488EEB'];
  const BUTTON_RADIUS = 12;

  const { loading, theme, lang } = useUIFactory();
  const t = lang?.t;

  const steps = useMemo<StepDefinition[]>(
    () => [
      { key: 'front', label: t?.('face_step_front') ?? 'Đưa mặt thẳng vào khung', },
      { key: 'left', label: t?.('face_step_left') ?? 'Nghiêng mặt sang phải' },
      { key: 'right', label: t?.('face_step_right') ?? 'Nghiêng mặt sang trái' },
      { key: 'smile' as any, label: t?.('face_step_smile') ?? 'Hãy mỉm cười' },
      { key: 'blink' as any, label: t?.('face_step_blink') ?? 'Hãy nháy mắt' },
    ],
    [t],
  );

  const stepMap = useMemo(
    () =>
      steps.reduce<Record<StepKey, StepDefinition>>((acc, s) => {
        acc[s.key] = s;
        return acc;
      }, {} as any),
    [steps],
  );

  const {
    cameraRef,
    device,
    hasPermission,
    permissionStatus,
    isCameraActive,
    isCameraReady,
    frameProcessor,
    handleFront,
    handleLeft,
    handleRight,
    handleSmile,
    handleBlink,
    refreshPermission,
  } = useFaceDetectionHandle();

  const permissionBlocked =
    permissionStatus === 'denied' || permissionStatus === 'restricted';
  const cameraStatusMessage = useMemo(() => {
    if (permissionBlocked)
      return 'Allow camera access in settings to continue.';
    if (!hasPermission) return 'Waiting for camera permission...';
    if (!device) return 'No compatible camera found.';
    if (!isCameraReady) return 'Preparing camera...';
    return 'Camera is waking up...';
  }, [device, hasPermission, isCameraReady, permissionBlocked]);

  const [currentStep, setCurrentStep] = useState<StepKey>('front');
  const [flowAttempt, setFlowAttempt] = useState(0);
  const [flowState, setFlowState] = useState<
    'idle' | 'running' | 'error' | 'done'
  >('idle');
  const [flowError, setFlowError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uploading, setUploading] = useState(false);

  const challengeRef = useRef<'smile' | 'blink'>('smile');
  const pickChallenge = useCallback(() => (Math.random() < 0.5 ? 'smile' : 'blink'), []);

  const [challengeStep, setChallengeStep] = useState<'smile' | 'blink'>('smile');

  const startFlow = useCallback(() => {
    const c = pickChallenge();
    challengeRef.current = c;
    setChallengeStep(c);
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
    [device, hasPermission, isCameraReady, startFlow],
  );

  function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    let t: any;
    const timeout = new Promise<never>((_, reject) => {
      t = setTimeout(() => reject(new Error(`Timeout ${label} after ${ms}ms`)), ms);
    });

    return Promise.race([p, timeout]).finally(() => clearTimeout(t));
  }

  useEffect(() => () => cancelRetry(), [cancelRetry]);
  useEffect(() => {
    preloadFaceIdModel().catch(e => console.warn('FaceID preload error:', e));
  }, []);
  const getErrorMessage = useCallback((reason?: string) => {
    switch (reason) {
      case 'camera_not_ready':
        return lang?.t('face_camera_not_ready');
      case 'face_not_front':
        return lang?.t('face_face_not_front');
      case 'face_not_left':
        return lang?.t('face_face_not_left');
      case 'face_not_right':
        return lang?.t('face_face_not_right');
      case 'capture_failed':
        return lang?.t('face_capture_failed');
      default:
        return null;
    }
  }, []);

  const handleFlowFailure = useCallback(
    (reason?: string, step?: StepKey, shouldRetry = true) => {
      setFlowState('error');
      const fallbackLabel = step ? stepMap[step]?.label : null;
      setFlowError(getErrorMessage(reason) ?? fallbackLabel ?? null);
      if (shouldRetry) {
        scheduleRetry();
      }
    },
    [getErrorMessage, scheduleRetry, stepMap],
  );

  useEffect(() => {
    if (isCameraReady && hasPermission && device && flowAttempt === 0) {
      startFlow();
    }
  }, [device, flowAttempt, hasPermission, isCameraReady, startFlow]);

  const addFilePrefix = (u: string) =>
    /^((file|content|https?):)\/\//.test(u) ? u : `file://${u}`;

  // async function rotateImage(uri) {
  //   const normalized = addFilePrefix(uri);

  //   const {width, height} = await new Promise(res => {
  //     Image.getSize(
  //       normalized,
  //       (w, h) => res({width: w, height: h}),
  //       () => res({width: 1080, height: 1080}),
  //     );
  //   });

  //   const out = await ImageResizer.createResizedImage(
  //     normalized,
  //     width,
  //     height,
  //     'JPEG',
  //     100,
  //     0, // chỉ rotation, không được truyền false
  //   );

  //   return addFilePrefix(out.uri);
  // }

  async function getSize(uri: string) {
    const normalized = addFilePrefix(uri);

    return await withTimeout(
      new Promise<{ width: number; height: number }>((resolve) => {
        Image.getSize(
          normalized,
          (w, h) => resolve({ width: w, height: h }),
          () => resolve({ width: 1080, height: 1920 }), // fallback
        );
      }),
      4000,
      `Image.getSize(${normalized})`,
    );
  }

  async function getExifRotation(uri: string): Promise<number> {
    const normalized = addFilePrefix(uri);

    try {
      const exif: any = await withTimeout(
        new Promise((resolve) => {
          // ⚠️ exif lib hay treo => luôn resolve fallback
          Exif.getExif(normalized, (_err, data) => resolve(data ?? null));
        }),
        2500,
        `Exif.getExif(${normalized})`,
      );

      const o = Number(exif?.Orientation ?? exif?.orientation ?? 1);
      if (o === 3) return 180;
      if (o === 6) return 90;
      if (o === 8) return 270;
      return 0;
    } catch {
      return 0;
    }
  }

  async function normalizeBeforeUpload(uri: string) {
    const normalized = addFilePrefix(uri);

    console.log('[Normalize] start:', normalized);

    const { width, height } = await getSize(uri);
    const rotation = await getExifRotation(uri);

    const swap = rotation === 90 || rotation === 270;
    const targetW = swap ? height : width;
    const targetH = swap ? width : height;

    console.log('[Normalize] size:', width, height, 'rot:', rotation, '->', targetW, targetH);

    const out = await withTimeout(
      ImageResizer.createResizedImage(normalized, targetW, targetH, 'JPEG', 95, rotation),
      15000,
      `ImageResizer(${normalized})`,
    );

    console.log('[Normalize] done:', out?.uri);
    return addFilePrefix(out.uri);
  }

  useEffect(() => {
    if (!flowAttempt || !isCameraReady || !hasPermission || !device) return;

    let cancelled = false;

    const runFlow = async () => {
      setFlowState('running');
      setFlowError(null);

      // 1) Front
      setCurrentStep('front');
      const frontRes = await handleFront();
      if (!frontRes?.ok) {
        handleFlowFailure(
          frontRes?.reason,
          'front',
          frontRes?.reason !== 'camera_not_ready',
        );
        return;
      }
      setCapturedFaces(prev => ({ ...prev, front: frontRes.uri }));
      try {
        const emb = await getFaceIdFromFile({ filePath: frontRes.uri });
        frontEmbeddingRef.current = emb;

        console.log('[FaceID] ✅ Embedding length:', emb.length);
        console.log('[FaceID] Sample:', emb.slice(0, 8)); // in thử vài giá trị đầu
        // nếu cần dùng embedding sau đó (gửi BE hay lưu local)

        setCapturedFaces(prev => ({ ...prev, frontEmbedding: emb }));
        console.log('frontEmbedding', emb);

        console.log('capturedFaces', capturedFaces);
      } catch (err) {
        console.error('[FaceID] ❌ Error while extracting embedding:', err);
      }
      // 2) Left
      setCurrentStep('left');
      const leftRes = await handleLeft();
      if (!leftRes?.ok) {
        handleFlowFailure(leftRes?.reason, 'left');
        return;
      }
      setCapturedFaces(prev => ({ ...prev, left: leftRes.uri }));

      // 3) Right
      setCurrentStep('right');
      const rightRes = await handleRight();
      if (!rightRes?.ok) {
        handleFlowFailure(rightRes?.reason, 'right');
        return;
      }
      setCapturedFaces(prev => ({ ...prev, right: rightRes.uri }));

      // 4) Random challenge: smile hoặc blink (sau khi chụp đủ 3 ảnh)
      const which = challengeRef.current; // 'smile' | 'blink'
      setCurrentStep(which as any);

      const liveRes =
        which === 'smile' ? await handleSmile?.() : await handleBlink?.();

      if (!liveRes?.ok) {
        handleFlowFailure(
          liveRes?.reason,
          which as any,
          liveRes?.reason !== 'camera_not_ready',
        );
        return;
      }

      // ✅ Dùng biến cục bộ, KHÔNG dùng state capturedFaces khi navigate
      if (!cancelled) {
        setFlowState('done');
        setUploading(true);

        try {
          // 1) XOAY 3 ẢNH
          const [frontUri, leftUri, rightUri] = await Promise.all([
            normalizeBeforeUpload(frontRes.uri),
            normalizeBeforeUpload(leftRes.uri),
            normalizeBeforeUpload(rightRes.uri),
          ]);

          // 2) UPLOAD 3 ẢNH LÊN BE → CLOUDFLARE
          // folder tuỳ bạn đặt; ví dụ "faces"
          const frontUp = await withTimeout(uploadSingle(frontUri, 'faces'), 30000, 'upload front');
          console.log('[Upload] front:', frontUp);

          const leftUp = await withTimeout(uploadSingle(leftUri, 'faces'), 30000, 'upload left');
          console.log('[Upload] left:', leftUp);

          const rightUp = await withTimeout(uploadSingle(rightUri, 'faces'), 30000, 'upload right');
          console.log('[Upload] right:', rightUp);

          const frontUrl = frontUp?.url || frontUri;
          const leftUrl = leftUp?.url || leftUri;
          const rightUrl = rightUp?.url || rightUri;

          if (cancelled) return;

          // 3) NAVIGATE VỚI URL CLOUD
          navigation.replace('PersonalInformation', {
            faces: {
              image_left: leftUrl,
              image_front: frontUrl,
              image_right: rightUrl,
              faceid_front: frontEmbeddingRef.current,
            },
          });
        } catch (e: any) {
          if (cancelled) return;

          setFlowState('error');
          setFlowError(e?.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
          // bạn có thể retry tự động nếu muốn:
          // scheduleRetry();
        } finally {
          if (!cancelled) setUploading(false);
        }
      }
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
    handleFront,
    handleLeft,
    handleRight,
    handleSmile,
    handleBlink,
    handleFlowFailure,
    cancelRetry,
  ]);

  // === TẠO PATH CHO SKIA ===
  // 1. Path cho nền xám bên trong

  const { innerOvalPath, innerOvalSvgPath, outerOvalPath, dimOutsidePath } =
    useMemo(() => {
      const innerRect = Skia.XYWHRect(
        STROKE_WIDTH / 2,
        STROKE_WIDTH / 2,
        OVAL_WIDTH - STROKE_WIDTH,
        OVAL_HEIGHT - STROKE_WIDTH,
      );
      const inner = Skia.Path.Make();
      inner.addOval(innerRect);

      const outerRect = Skia.XYWHRect(
        STROKE_WIDTH / 2,
        STROKE_WIDTH / 2,
        OVAL_WIDTH - STROKE_WIDTH,
        OVAL_HEIGHT - STROKE_WIDTH,
      );
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
  const [capturedFaces, setCapturedFaces] = useState<{
    front?: string;
    left?: string;
    right?: string;
    frontEmbedding?: Float32Array; // ✅ thêm dòng này
  }>({});

  if (loading || !theme || !lang) return null;
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <HeaderBar
          title={lang.t('face_detection_title')}
          onBack={() => navigation?.goBack?.()}
          extra={<View style={{ width: 34 }} />}
        />

        {/* Khung oval (THAY BẰNG SKIA CANVAS) */}
        <View style={styles.faceGuide}>
          <View
            style={[
              styles.ovalWrapper,
              { width: OVAL_WIDTH, height: OVAL_HEIGHT },
            ]}>
            <MaskedView
              style={StyleSheet.absoluteFillObject}
              maskElement={
                <Svg width={OVAL_WIDTH} height={OVAL_HEIGHT}>
                  <SvgPath d={innerOvalSvgPath} fill="#fff" />
                </Svg>
              }>
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
                    <Text style={styles.cameraFallbackText}>
                      {cameraStatusMessage}
                    </Text>
                    {!permissionBlocked && (
                      <TouchableOpacity
                        style={styles.cameraFallbackButton}
                        onPress={refreshPermission}>
                        <Text style={styles.cameraFallbackButtonText}>
                          Enable camera
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </MaskedView>

            <Canvas
              style={[StyleSheet.absoluteFillObject]}
              pointerEvents="none">
              <SkiaPath
                path={dimOutsidePath}
                style="fill"
                color={theme.colors.background}
              />
              <SkiaPath
                path={outerOvalPath}
                style="stroke"
                strokeWidth={STROKE_WIDTH}>
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
        ) : uploading ? (
          <Text style={styles.statusText}>Đang tải 3 ảnh lên hệ thống...</Text>
        ) : flowState === 'running' ? (
          <Text style={styles.statusText}>{lang.t('face_status_label')}</Text>
        ) : null}
        {flowState === 'error' && (
          <TouchableOpacity style={styles.retryLink} onPress={startFlow}>
            <Text style={styles.retryLinkText}>
              {lang.t('face_retry_link')}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ alignItems: 'center', marginBottom: 50 }}>
          <GradientButton
            onPress={() => {
              if (flowState === 'running' || uploading) return;
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
            style={{ width: '80%' }}>
            {uploading ? (
              <ActivityIndicator size="small" color="#0B1A39" />
            ) : (
              <Text style={{ color: '#0B1A39', fontWeight: '600' }}>
                {stepMap[currentStep].label}
              </Text>
            )}
          </GradientButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    faceGuide: {
      marginTop: '20%',
      marginBottom: '10%',
      alignItems: 'center', // Giữ lại để căn giữa Canvas
      justifyContent: 'center',
      width: '100%',

      // Thêm shadow/elevation vào đây nếu bạn muốn
      shadowColor: '#1E4DFF',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 2,
    },

    ovalWrapper: {
      position: 'relative',
    },
    cameraSurface: {
      flex: 1,
      backgroundColor: '#0B1A39',
    },
    cameraFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: '#0B1A39',
      gap: 12,
    },
    cameraFallbackText: {
      color: '#ffffff',
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
    },
    cameraFallbackButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#ffffff',
    },
    cameraFallbackButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    statusText: {
      marginTop: 16,
      paddingHorizontal: 24,
      textAlign: 'center',
      fontSize: 13,
      color: '#6B7AA1',
    },
    retryLink: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    retryLinkText: {
      color: '#1E4DFF',
      fontWeight: '700',
      alignSelf: 'center',
    },
  });
