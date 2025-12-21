import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useUIFactory} from '../ui/factory/useUIFactory';
import HeaderBar from '../components/common/HeaderBar';
import {RootStackParamList} from '../navigation/AppNavigator';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, {Path as SvgPath} from 'react-native-svg';
import {Camera} from 'react-native-vision-camera';
import {useFaceDetectionHandle} from '../utils/FaceDetectionHandle';

import {
  Canvas,
  Path as SkiaPath,
  Skia,
  LinearGradient,
  vec,
  PathOp,
} from '@shopify/react-native-skia';

import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/User';
import Toast from 'react-native-toast-message';
import {uploadSingle} from '../api/uploadApi';

import {getFaceIdFromFile, preloadFaceIdModel} from '../utils/face-id-utils';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EmployeeFaceDetection'
>;

export default function EmployeeFaceDetectionScreen({
  navigation,
  route,
}: Props) {
  const {width} = useWindowDimensions();
  const OVAL_WIDTH = width * 0.8;
  const OVAL_HEIGHT = OVAL_WIDTH * (4.5 / 3);
  const STROKE_WIDTH = 12;
  const RING_GRADIENT = ['#2EF5D2', '#1E4DFF'];
  const {type = 'check_in'} = route.params ?? {};
  const {theme, lang} = useUIFactory();
  const stepLabel =
    lang?.t('face_step_put_face_into_frame') ?? 'Đưa khuôn mặt vào khung';

  useEffect(() => {
    preloadFaceIdModel().catch(() => {});
  }, []);

  // camera
  const {
    cameraRef,
    device,
    hasPermission,
    isCameraActive,
    isCameraReady,
    frameProcessor,
    handleFront,
    refreshPermission,
  } = useFaceDetectionHandle({preferredDevice: 'front'});

  // flow
  const [flowAttempt, setFlowAttempt] = useState(0);
  const [flowState, setFlowState] = useState<
    'idle' | 'running' | 'error' | 'done'
  >('idle');
  const [flowError, setFlowError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const retryRef = useRef<number | null>(null);

  const startFlow = useCallback(() => {
    setFlowAttempt(p => p + 1);
  }, []);

  // submit checkin
  const submitAttendance = useCallback(
    async (faceEmbedding: Float32Array, imageUrl: string) => {
      try {
        const payload = {
          type, // ✅ LẤY TỪ ROUTE: check_in | check_out
          face_id: Array.from(faceEmbedding || []),
          image: imageUrl,
        };

        const {status} = await apiHandle
          .callApi(User.CheckAttendance, payload)
          .asPromise();

        if (status.isError) {
          Toast.show({
            type: 'error',
            text1:
              type === 'check_in' ? 'Check-in thất bại' : 'Check-out thất bại',
            text2: status.errorMessage ?? 'Thử lại',
          });

          navigation.replace('EmployeeAttendance');
          return;
        }

        Toast.show({
          type: 'success',
          text1:
            type === 'check_in'
              ? 'Check-in thành công'
              : 'Check-out thành công',
        });

        navigation.replace('EmployeeAttendance');
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Lỗi hệ thống',
        });
        navigation.replace('EmployeeAttendance');
      }
    },
    [navigation, type],
  );

  const fail = useCallback(
    (reason?: string) => {
      setFlowState('error');
      setFlowError(
        reason === 'faceid_error'
          ? 'Không trích xuất được FaceID, vui lòng thử lại'
          : 'Không nhận diện được khuôn mặt',
      );

      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(() => {
        retryRef.current = null;
        navigation.replace('EmployeeAttendance'); // Fail -> về trước luôn
      }, 1200) as any;
    },
    [navigation],
  );

  // auto start
  useEffect(() => {
    if (flowAttempt === 0 && hasPermission && isCameraReady && device) {
      startFlow();
    }
  }, [flowAttempt, hasPermission, isCameraReady, device, startFlow]);

  // flow engine
  useEffect(() => {
    if (!flowAttempt || !hasPermission || !isCameraReady || !device) return;

    let cancelled = false;

    const run = async () => {
      setFlowState('running');
      setFlowError(null);

      const f = await handleFront();
      if (!f?.ok || !f?.uri) {
        if (!cancelled) fail(f?.reason);
        return;
      }

      try {
        const emb = await getFaceIdFromFile({filePath: f.uri});

        setSubmitting(true);
        const uploadRes = await uploadSingle(f.uri, 'checkin');
        setSubmitting(false);

        if (!uploadRes?.url) {
          if (!cancelled) fail('upload_error');
          return;
        }

        if (!cancelled) {
          setFlowState('done');
          await submitAttendance(emb, uploadRes.url);
        }
      } catch {
        if (!cancelled) fail('faceid_error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    flowAttempt,
    hasPermission,
    isCameraReady,
    device,
    handleFront,
    fail,
    submitAttendance,
  ]);

  // skia paths
  const {innerOvalSvgPath, outerOvalPath, dimOutsidePath} = useMemo(() => {
    const inner = Skia.Path.Make();
    inner.addOval(
      Skia.XYWHRect(
        STROKE_WIDTH / 2,
        STROKE_WIDTH / 2,
        OVAL_WIDTH - STROKE_WIDTH,
        OVAL_HEIGHT - STROKE_WIDTH,
      ),
    );

    const outer = Skia.Path.Make();
    outer.addOval(
      Skia.XYWHRect(
        STROKE_WIDTH / 2,
        STROKE_WIDTH / 2,
        OVAL_WIDTH - STROKE_WIDTH,
        OVAL_HEIGHT - STROKE_WIDTH,
      ),
    );

    const full = Skia.Path.Make();
    full.addRect(Skia.XYWHRect(0, 0, OVAL_WIDTH, OVAL_HEIGHT));

    const outside = full.copy();
    outside.op(inner, PathOp.Difference);

    return {
      innerOvalSvgPath: inner.toSVGString(),
      outerOvalPath: outer,
      dimOutsidePath: outside,
    };
  }, []);

  if (!theme || !lang) return null;
  const styles = makeStyles(theme);

  const runningText = submitting
    ? type === 'check_in'
      ? 'Đang check-in...'
      : 'Đang check-out...'
    : stepLabel;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView>
        <HeaderBar
          title={lang.t('face_detection_title')}
          onBack={() => navigation.goBack()}
          extra={<View style={{width: 34}} />}
        />

        <View style={styles.faceGuide}>
          <View
            style={[
              styles.ovalWrapper,
              {width: OVAL_WIDTH, height: OVAL_HEIGHT},
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
                    photo
                    frameProcessor={frameProcessor}
                  />
                ) : (
                  <View style={styles.cameraFallback}>
                    <Text style={styles.cameraFallbackText}>
                      Camera unavailable
                    </Text>
                    <TouchableOpacity
                      style={styles.cameraFallbackButton}
                      onPress={refreshPermission}>
                      <Text style={styles.cameraFallbackButtonText}>
                        Enable Camera
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </MaskedView>

            <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
                  start={vec(20, 0)}
                  end={vec(OVAL_WIDTH, OVAL_HEIGHT)}
                  colors={RING_GRADIENT}
                />
              </SkiaPath>
            </Canvas>
          </View>
        </View>

        {flowState === 'running' && (
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusText,
                submitting && styles.statusTextSubmitting,
              ]}>
              {runningText}
            </Text>
            <ActivityIndicator
              size="small"
              color="#1E4DFF"
              style={{marginLeft: 8}}
            />
          </View>
        )}

        {flowState === 'error' && (
          <>
            <Text style={styles.statusText}>{flowError}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    faceGuide: {
      marginTop: '18%',
      marginBottom: '6%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ovalWrapper: {position: 'relative'},
    cameraSurface: {flex: 1, backgroundColor: '#000'},
    cameraFallback: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    cameraFallbackText: {color: '#fff', marginBottom: 10},
    cameraFallbackButton: {
      borderWidth: 1,
      borderColor: '#fff',
      padding: 8,
      borderRadius: 6,
    },
    cameraFallbackButtonText: {color: '#fff'},

    statusRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    statusText: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '600',
      color: '#2A3A5E',
    },
    statusTextSubmitting: {
      color: '#1E4DFF',
    },
  });
