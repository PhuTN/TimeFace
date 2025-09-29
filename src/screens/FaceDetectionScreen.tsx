import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  useWindowDimensions,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  CameraPosition,
  DrawableFrame,
  Frame,
  Camera as VisionCamera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {useAppState} from '@react-native-community/hooks';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  Camera,
  Face,
  FaceDetectionOptions,
  Contours,
  Landmarks,
} from 'react-native-vision-camera-face-detector';

// Canvas & Path để vẽ elip
import {Canvas, Path, Skia, ClipOp, TileMode} from '@shopify/react-native-skia';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/user';

type FitState = 'ok' | 'tooSmall' | 'tooBig' | 'offCenter';

// === Added for Screen/Paper (2D) detection ===
type Verdict = 'unknown' | 'likely_paper_or_screen' | 'likely_real';
// ============================================

function FaceDetection() {
  const {width, height} = useWindowDimensions();
  const {hasPermission, requestPermission} = useCameraPermission();

  // --- State/refs cho gallery & chụp tự động ---
  const [photos, setPhotos] = useState<string[]>([]);
  const captureLock = useRef<boolean>(false);
  const captureTimeout = useRef<NodeJS.Timeout | null>(null);

  const [cameraMounted, setCameraMounted] = useState<boolean>(false);
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>('front');

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'fast',
    classificationMode: 'all',
    contourMode: 'all',
    landmarkMode: 'all',
    windowWidth: width,
    windowHeight: height,
  }).current;

  const isFocused = useIsFocused();
  const appState = useAppState();
  const isCameraActive = !cameraPaused && isFocused && appState === 'active';
  const cameraDevice = useCameraDevice(cameraFacing);
  const camera = useRef<VisionCamera>(null);

  // animated rect
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const aRot = useSharedValue(0);

  const boundingBoxStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(0,255,0,0.35)',
    width: withTiming(aFaceW.value, {duration: 80}),
    height: withTiming(aFaceH.value, {duration: 80}),
    left: withTiming(aFaceX.value, {duration: 80}),
    top: withTiming(aFaceY.value, {duration: 80}),
    transform: [{rotate: `${aRot.value}deg`}],
  }));

  useEffect(() => {
    if (!hasPermission) requestPermission();
    return () => {
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
    };
  }, []);

  function handleUiRotation(rotation: number) {
    aRot.value = rotation;
  }

  function handleCameraMountError(error: any) {
    console.error('camera mount error', error);
  }

  // --- Tham số khung elip hướng dẫn ---
  const GUIDE_RX = width * 0.45;
  const GUIDE_RY = height * 0.36;
  const GUIDE_CX = width / 2;
  const GUIDE_CY = height / 2;

  // --- Siết điều kiện chụp ---
  const ELLIPSE_MARGIN = 0.95;
  const STABLE_FRAMES = 6;
  const MIN_FILL = 1.0;
  const MAX_FILL = 2.0;
  const stableFramesRef = useRef<number>(0);

  const [fitState, setFitState] = useState<FitState>('offCenter');

  // === Added for Screen/Paper (2D) detection ===
  const STRAIGHTNESS_THR = 0.035;
  const STRAIGHT_SEG_MIN = 18;
  const STRAIGHT_SEG_RATIO = 0.55;
  const PARALLAX_MIN_YAW_DELTA = 7;
  const PARALLAX_AREA_STABLE = 0.08;
  const VOTE_WINDOW = 15;
  const SPOOF_VOTE_THR = 9;

  const [verdict, setVerdict] = useState<Verdict>('unknown');
  const [debugInfo, setDebugInfo] = useState<string>('');
  type Track = {
    t: number;
    cx: number;
    cy: number;
    w: number;
    h: number;
    yaw: number;
    pitch?: number;
    roll?: number;
    ratio: number;
  };
  const trackBuf = useRef<Track[]>([]);
  const voteBuf = useRef<number[]>([]);

  function estimateYawApprox(face: Face): number {
    const left = face.contours?.LEFT_EYE?.points?.[0];
    const right = face.contours?.RIGHT_EYE?.points?.[3];
    if (left && right) return right.x - left.x;
    const {x, width: bw} = face.bounds;
    return x + bw * 0.6 - (x + bw * 0.4);
  }

  function faceEdgeStraightness(contours?: Contours): {
    straightRatio: number;
    meanCurvature: number;
  } {
    const pts = contours?.FACE?.points || [];
    if (pts.length < 12) return {straightRatio: 0, meanCurvature: 1.0};

    let straightLen = 0,
      totalLen = 0,
      curvSum = 0,
      curvCnt = 0;
    const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
    const angle = (a: any, b: any, c: any) => {
      const abx = a.x - b.x,
        aby = a.y - b.y;
      const cbx = c.x - b.x,
        cby = c.y - b.y;
      const dot = abx * cbx + aby * cby;
      const la = Math.hypot(abx, aby);
      const lc = Math.hypot(cbx, cby);
      if (la * lc === 0) return 0;
      let cos = dot / (la * lc);
      cos = Math.max(-1, Math.min(1, cos));
      return Math.acos(cos);
    };

    const WIN = 5;
    for (let i = 0; i + WIN < pts.length; i++) {
      const a = pts[i],
        m = pts[i + Math.floor(WIN / 2)],
        c = pts[i + WIN];
      const segLen = dist(a, c);
      totalLen += segLen;
      const ang = angle(a, m, c);
      const curvature = Math.abs(Math.PI - ang);
      curvSum += curvature;
      curvCnt++;
      if (segLen > STRAIGHT_SEG_MIN && curvature < STRAIGHTNESS_THR)
        straightLen += segLen;
    }
    return {
      straightRatio: totalLen > 0 ? straightLen / totalLen : 0,
      meanCurvature: curvCnt > 0 ? curvSum / curvCnt : 1.0,
    };
  }

  function pushVote(spoofLike: boolean) {
    voteBuf.current.push(spoofLike ? 1 : 0);
    if (voteBuf.current.length > VOTE_WINDOW) voteBuf.current.shift();
    const sum = voteBuf.current.reduce((a, b) => a + b, 0);
    if (voteBuf.current.length >= Math.min(VOTE_WINDOW, 6)) {
      if (sum >= SPOOF_VOTE_THR) setVerdict('likely_paper_or_screen');
      else if (sum <= voteBuf.current.length - SPOOF_VOTE_THR)
        setVerdict('likely_real');
      else setVerdict('unknown');
    } else setVerdict('unknown');
  }
  // ============================================================

  // === Added v2: Planarity check ===
  const PLANAR_MIN_MOVE = 8;
  const PLANAR_RMSE_THR = 0.5;
  const PLANAR_VOTES_THR = 15;
  type LandTrack = {
    t: number;
    yaw: number;
    cx: number;
    cy: number;
    pts: {x: number; y: number}[];
  };
  const landBuf = useRef<LandTrack[]>([]);
  const planarVotesBuf = useRef<number[]>([]);
  function pushPlanarVote(isPlanar: boolean) {
    planarVotesBuf.current.push(isPlanar ? 1 : 0);
    if (planarVotesBuf.current.length > VOTE_WINDOW)
      planarVotesBuf.current.shift();
  }
  function collectFacePoints(contours?: Contours) {
    const res: {x: number; y: number}[] = [];
    if (!contours) return res;
    const keys: (keyof Contours)[] = [
      'FACE',
      'LEFT_EYE',
      'RIGHT_EYE',
      'LEFT_EYEBROW',
      'RIGHT_EYEBROW',
      'NOSE_BRIDGE',
      'NOSE_BOTTOM',
      'UPPER_LIP',
      'LOWER_LIP',
      'MOUTH',
    ];
    keys.forEach(k => {
      const pts = contours[k]?.points || [];
      for (let i = 0; i < pts.length; i++) res.push({x: pts[i].x, y: pts[i].y});
    });
    return res;
  }
  function affineRmse(
    pointsP: {x: number; y: number}[],
    pointsQ: {x: number; y: number}[],
  ) {
    const n = Math.min(pointsP.length, pointsQ.length);
    if (n < 8) return {rmse: 1e9};
    const X: number[][] = [],
      b: number[] = [];
    for (let i = 0; i < n; i++) {
      const p = pointsP[i],
        q = pointsQ[i];
      X.push([p.x, p.y, 1, 0, 0, 0]);
      X.push([0, 0, 0, p.x, p.y, 1]);
      b.push(q.x, q.y);
    }
    const Xt = X[0].map((_, j) => X.map(r => r[j]));
    const XtX = Xt.map(r => Array(Xt[0].length).fill(0));
    for (let i = 0; i < Xt.length; i++)
      for (let k = 0; k < X.length; k++) {
        const aik = Xt[i][k];
        for (let j = 0; j < Xt[0].length; j++) XtX[i][j] += aik * X[k][j];
      }
    const Xtb = Xt.map(row => row.reduce((s, ai, i) => s + ai * b[i], 0));
    function solve6(A: number[][], y: number[]) {
      const n = 6,
        M = A.map(r => r.slice()),
        v = y.slice();
      for (let i = 0; i < n; i++) {
        let piv = i;
        for (let r = i + 1; r < n; r++)
          if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
        if (Math.abs(M[piv][i]) < 1e-8) return null;
        if (piv !== i) {
          [M[i], M[piv]] = [M[piv], M[i]];
          [v[i], v[piv]] = [v[piv], v[i]];
        }
        const d = M[i][i];
        for (let j = i; j < n; j++) M[i][j] /= d;
        v[i] /= d;
        for (let r = 0; r < n; r++)
          if (r !== i) {
            const f = M[r][i];
            if (f !== 0) {
              for (let j = i; j < n; j++) M[r][j] -= f * M[i][j];
              v[r] -= f * v[i];
            }
          }
      }
      return v;
    }
    const a = solve6(XtX, Xtb);
    if (!a) return {rmse: 1e9};
    let se = 0;
    for (let i = 0; i < n; i++) {
      const p = pointsP[i],
        q = pointsQ[i];
      const x2 = a[0] * p.x + a[1] * p.y + a[2];
      const y2 = a[3] * p.x + a[4] * p.y + a[5];
      se += (x2 - q.x) * (x2 - q.x) + (y2 - q.y) * (y2 - q.y);
    }
    return {rmse: Math.sqrt(se / n)};
  }
  // === end Added v2 ===

  // === Added v3: Blink & Pose/Aspect rigidity ===
  const BLINK_PROB_THR = 0.35;
  const BLINK_MIN_DURATION = 1;
  const BLINK_WINDOW_MS = 6000;
  const blinkEvents = useRef<number[]>([]);
  const lastEyeState = useRef<{l: boolean; r: boolean; count: number}>({
    l: true,
    r: true,
    count: 0,
  });

  const RIGID_MOVE_MIN_PIX = 12;
  const POSE_VAR_THR = 2.0;
  const RATIO_VAR_THR = 0.01;

  // NEW: hiển thị “nháy mắt 1 cái” khi đến bước cần blink
  const [needBlink, setNeedBlink] = useState<boolean>(false);
  // ============================================================

  // Hàm đánh giá trạng thái khớp elip
  function getFitState(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): FitState {
    const {x, y, width: bw, height: bh} = bounds;
    const k = ELLIPSE_MARGIN;
    const rx2 = GUIDE_RX * k * (GUIDE_RX * k);
    const ry2 = GUIDE_RY * k * (GUIDE_RY * k);

    const points = [
      {px: x, py: y},
      {px: x + bw, py: y},
      {px: x, py: y + bh},
      {px: x + bw, py: y + bh},
      {px: x + bw / 2, py: y},
      {px: x + bw / 2, py: y + bh},
      {px: x, py: y + bh / 2},
      {px: x + bw, py: y + bh / 2},
    ];

    const insideAll = points.every(({px, py}) => {
      const dx = px - GUIDE_CX;
      const dy = py - GUIDE_CY;
      return (dx * dx) / rx2 + (dy * dy) / ry2 <= 1.0;
    });
    if (!insideAll) return 'offCenter';

    const tooSmall = bw < GUIDE_RX * MIN_FILL || bh < GUIDE_RY * MIN_FILL;
    if (tooSmall) return 'tooSmall';
    const tooBig = bw > GUIDE_RX * MAX_FILL || bh > GUIDE_RY * MAX_FILL;
    if (tooBig) return 'tooBig';

    const faceCX = x + bw / 2;
    const faceCY = y + bh / 2;
    const nx = (faceCX - GUIDE_CX) / GUIDE_RX;
    const ny = (faceCY - GUIDE_CY) / GUIDE_RY;
    const centerOk = nx * nx + ny * ny <= 0.8 * 0.8;
    if (!centerOk) return 'offCenter';

    return 'ok';
  }

  async function tryAutoCapture() {
    if (captureLock.current) return;
    if (!camera.current) return;

    try {
      captureLock.current = true;
      const photo = await (camera.current as any).takePhoto?.({
        qualityPrioritization: 'balanced',
        skipMetadata: false,
      });
      if (photo?.path) setPhotos(prev => [photo.path, ...prev]);
    } catch (e) {
      console.warn('takePhoto failed', e);
    } finally {
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
      captureTimeout.current = setTimeout(() => {
        captureLock.current = false;
      }, 1500);
    }
  }

  function handleFacesDetected(faces: Face[], frame: Frame): void {
    if (faces.length <= 0) {
      aFaceW.value = 0;
      aFaceH.value = 0;
      aFaceX.value = 0;
      aFaceY.value = 0;
      stableFramesRef.current = 0;
      setFitState('offCenter');

      trackBuf.current = [];
      landBuf.current = [];
      pushVote(false);
      pushPlanarVote(false);
      setDebugInfo('no face');
      setNeedBlink(false); // reset nhắc blink
      return;
    }

    const face = faces[0];
    const {bounds, contours} = face;
    const {width: bw, height: bh, x, y} = bounds;

    // vẽ khung chữ nhật
    aFaceW.value = bw;
    aFaceH.value = bh;
    aFaceX.value = x;
    aFaceY.value = y;

    // 1) Flat-edge
    const {straightRatio, meanCurvature} = faceEdgeStraightness(contours);
    const flatEdge =
      straightRatio >= STRAIGHT_SEG_RATIO &&
      meanCurvature < STRAIGHTNESS_THR * 2.5;

    // 2) Parallax theo yaw & diện tích
    // @ts-ignore
    const pitch = typeof face.pitch === 'number' ? face.pitch : undefined;
    // @ts-ignore
    const roll = typeof face.roll === 'number' ? face.roll : undefined;

    const yaw = estimateYawApprox(face);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const ratio = bounds.width / Math.max(1, bounds.height);
    const area = bounds.width * bounds.height;

    const buf = trackBuf.current;
    const prev =
      buf.findLast?.(t => Math.abs(yaw - t.yaw) >= PARALLAX_MIN_YAW_DELTA) ||
      [...buf]
        .reverse()
        .find(t => Math.abs(yaw - t.yaw) >= PARALLAX_MIN_YAW_DELTA);

    let parallaxLooks2D = false;
    if (prev) {
      const prevArea = prev.w * prev.h;
      const areaChange = Math.abs(area - prevArea) / Math.max(area, prevArea);
      if (areaChange <= PARALLAX_AREA_STABLE) parallaxLooks2D = true;
    }

    buf.push({
      t: Date.now(),
      cx,
      cy,
      w: bounds.width,
      h: bounds.height,
      yaw,
      pitch,
      roll,
      ratio,
    });
    if (buf.length > 40) buf.shift();

    // 3) Planarity (affine fit)
    const currPts = collectFacePoints(contours);
    let isPlanarNow = false;
    if (currPts.length >= 12) {
      const prevL =
        landBuf.current.findLast?.(
          t =>
            Math.abs(yaw - t.yaw) >= PLANAR_MIN_MOVE ||
            Math.hypot(cx - t.cx, cy - t.cy) >= PLANAR_MIN_MOVE,
        ) ||
        [...landBuf.current]
          .reverse()
          .find(
            t =>
              Math.abs(yaw - t.yaw) >= PLANAR_MIN_MOVE ||
              Math.hypot(cx - t.cx, cy - t.cy) >= PLANAR_MIN_MOVE,
          );
      if (prevL && prevL.pts.length >= 12) {
        const n = Math.min(prevL.pts.length, currPts.length);
        const {rmse} = affineRmse(prevL.pts.slice(0, n), currPts.slice(0, n));
        if (rmse <= PLANAR_RMSE_THR) isPlanarNow = true;
        pushPlanarVote(isPlanarNow);
      }
      landBuf.current.push({
        t: Date.now(),
        yaw,
        cx,
        cy,
        pts: currPts.slice(0, 160),
      });
      if (landBuf.current.length > 24) landBuf.current.shift();
    }

    // Pose/Aspect rigidity
    let rigidPose2D = false,
      rigidRatio2D = false;
    const recent = [...buf].slice(-10);
    if (recent.length >= 6) {
      const dx = Math.abs(recent[recent.length - 1].cx - recent[0].cx);
      const dy = Math.abs(recent[recent.length - 1].cy - recent[0].cy);
      const moved = Math.hypot(dx, dy) >= RIGID_MOVE_MIN_PIX;

      const yawVar = variance(recent.map(r => r.yaw));
      const pitchVar = variance(
        recent.map(r => r.pitch ?? recent[0].pitch ?? 0),
      );
      const rollVar = variance(recent.map(r => r.roll ?? recent[0].roll ?? 0));
      rigidPose2D =
        moved &&
        yawVar < POSE_VAR_THR &&
        pitchVar < POSE_VAR_THR &&
        rollVar < POSE_VAR_THR;

      const ratioVar = variance(recent.map(r => r.ratio));
      rigidRatio2D = moved && ratioVar < RATIO_VAR_THR;
    }
    function variance(arr: number[]) {
      if (!arr.length) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length;
    }

    // Blink liveness
    const now = Date.now();
    // @ts-ignore
    const lOpen =
      typeof face.leftEyeOpenProbability === 'number'
        ? face.leftEyeOpenProbability
        : 1;
    // @ts-ignore
    const rOpen =
      typeof face.rightEyeOpenProbability === 'number'
        ? face.rightEyeOpenProbability
        : 1;
    const lClosed = lOpen < BLINK_PROB_THR,
      rClosed = rOpen < BLINK_PROB_THR;

    if (lClosed && rClosed) {
      lastEyeState.current.count += 1;
    } else {
      if (lastEyeState.current.count >= BLINK_MIN_DURATION) {
        blinkEvents.current.push(now);
        if (blinkEvents.current.length > 10) blinkEvents.current.shift();
      }
      lastEyeState.current.count = 0;
    }
    while (
      blinkEvents.current.length &&
      now - blinkEvents.current[0] > BLINK_WINDOW_MS
    ) {
      blinkEvents.current.shift();
    }
    const hasRecentBlink = blinkEvents.current.length > 0;

    // tổng hợp phán quyết
    const spoofLike =
      flatEdge || parallaxLooks2D || isPlanarNow || rigidPose2D || rigidRatio2D;
    pushVote(spoofLike);

    const planarVotes = planarVotesBuf.current.reduce((a, b) => a + b, 0);
    setDebugInfo(
      `straight=${straightRatio.toFixed(2)} curv=${meanCurvature.toFixed(3)} ` +
        `yaw=${yaw.toFixed(1)} parallax2D=${
          parallaxLooks2D ? 1 : 0
        } planarVotes=${planarVotes} ` +
        `rigidPose=${rigidPose2D ? 1 : 0} rigidRatio=${
          rigidRatio2D ? 1 : 0
        } blink=${hasRecentBlink ? 1 : 0}`,
    );

    // đánh giá trạng thái khớp elip
    const state = getFitState(bounds);
    setFitState(state);

    // === NEW: chỉ hiện “Nháy mắt 1 cái” đúng thời điểm cần blink
    const strong2D =
      verdict === 'likely_paper_or_screen' ||
      planarVotes >= PLANAR_VOTES_THR ||
      rigidPose2D ||
      rigidRatio2D;
    if (state === 'ok' && !strong2D && !hasRecentBlink) {
      setNeedBlink(true);
    } else {
      setNeedBlink(false);
    }

    if (state === 'ok') {
      stableFramesRef.current += 1;
      if (stableFramesRef.current >= STABLE_FRAMES) {
        if (isCameraActive && cameraMounted && !cameraPaused) {
          if (!strong2D && hasRecentBlink) {
            tryAutoCapture();
          }
        }
        stableFramesRef.current = 0;
      }
    } else {
      stableFramesRef.current = 0;
    }
  }

  // Skia (tuỳ chọn – giữ phần blur/viền như ví dụ gốc)
  function handleSkiaActions(faces: Face[], frame: DrawableFrame): void {
    'worklet';
    if (faces.length <= 0) return;

    const {bounds, contours /*, landmarks*/} = faces[0];

    const blurRadius = 20;
    const blurFilter = Skia.ImageFilter.MakeBlur(
      blurRadius,
      blurRadius,
      TileMode.Decal,
      null,
    );
    const blurPaint = Skia.Paint();
    blurPaint.setImageFilter(blurFilter);
    const contourPath = Skia.Path.Make();
    const necessaryContours: (keyof Contours)[] = [
      'FACE',
      'LEFT_CHEEK',
      'RIGHT_CHEEK',
    ];
    necessaryContours.map(key => {
      contours?.[key]?.map((point, index) => {
        if (index === 0) contourPath.moveTo(point.x, point.y);
        else contourPath.lineTo(point.x, point.y);
      });
      contourPath.close();
    });
    frame.save();
    frame.clipPath(contourPath, ClipOp.Intersect, true);
    frame.render(blurPaint);
    frame.restore();

    const rectPaint = Skia.Paint();
    rectPaint.setColor(Skia.Color('rgba(0,150,255,0.7)'));
    rectPaint.setStyle(1);
    rectPaint.setStrokeWidth(3);
    frame.drawRect(bounds, rectPaint);
  }

  const clearAllPhotos = () => setPhotos([]);

  async function hello() {
    await apiHandle
      .callApi(User.GetAll, {page: 1, pageSize: 20})
      .response((status, res) => {
        if (!status.isError) {
          console.log('Users:', res);
        }
      });
  }

  return (
    <>
      <View
        style={[
          StyleSheet.absoluteFill,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        {hasPermission && cameraDevice ? (
          <>
            {cameraMounted && (
              <>
                <Camera
                  // @ts-ignore
                  ref={camera}
                  style={StyleSheet.absoluteFill}
                  isActive={isCameraActive}
                  device={cameraDevice}
                  onError={handleCameraMountError}
                  faceDetectionCallback={handleFacesDetected}
                  onUIRotationChanged={handleUiRotation}
                  photo={true}
                  // @ts-ignore
                  skiaActions={handleSkiaActions}
                  faceDetectionOptions={{
                    ...faceDetectionOptions,
                    autoMode,
                    cameraFacing,
                  }}
                />

                {/* Overlay: khung elip hướng dẫn */}
                <View
                  pointerEvents="none"
                  style={[styles.guideContainer, {width, height}]}>
                  <Canvas style={StyleSheet.absoluteFill}>
                    {(() => {
                      const rect = Skia.XYWHRect(
                        GUIDE_CX - GUIDE_RX,
                        GUIDE_CY - GUIDE_RY,
                        GUIDE_RX * 2,
                        GUIDE_RY * 2,
                      );
                      const path = Skia.Path.Make();
                      path.addOval(rect);
                      const strokeColor =
                        fitState === 'ok'
                          ? 'rgba(0,255,0,0.95)'
                          : fitState === 'tooSmall'
                          ? 'rgba(255,200,0,0.95)'
                          : fitState === 'tooBig'
                          ? 'rgba(255,100,0,0.95)'
                          : 'rgba(255,255,255,0.95)';
                      return (
                        <Path
                          path={path}
                          style="stroke"
                          strokeWidth={3}
                          color={strokeColor}
                        />
                      );
                    })()}
                  </Canvas>

                  <Text style={styles.guideText}>
                    {fitState === 'ok' && 'Giữ nguyên — sắp chụp...'}
                    {fitState === 'tooSmall' && 'Lại gần camera hơn'}
                    {fitState === 'tooBig' && 'Lùi ra xa một chút'}
                    {fitState === 'offCenter' &&
                      'Căn giữa khuôn mặt trong elip'}
                  </Text>

                  {/* Thông báo 2D/3D + debug */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 500,
                      width: '100%',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={[
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          fontWeight: '700',
                          color: '#fff',
                          textShadowColor: 'rgba(0,0,0,0.4)',
                          textShadowOffset: {width: 0, height: 1},
                          textShadowRadius: 2,
                        },
                        verdict === 'likely_paper_or_screen'
                          ? {backgroundColor: 'rgba(200,0,0,0.85)'}
                          : verdict === 'likely_real'
                          ? {backgroundColor: 'rgba(0,150,0,0.85)'}
                          : {backgroundColor: 'rgba(120,120,120,0.85)'},
                      ]}>
                      {verdict === 'likely_paper_or_screen' &&
                        '⚠️ Nghi là ảnh/màn hình đặt trước camera'}
                      {verdict === 'likely_real' && '✅ Có vẻ mặt thật (3D)'}
                      {verdict === 'unknown' && 'Đang kiểm tra 2D/3D…'}
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        opacity: 0.9,
                        marginTop: 4,
                        fontSize: 12,
                      }}>
                      {debugInfo}
                    </Text>
                  </View>

                  {/* NEW: Banner yêu cầu blink */}
                  {needBlink && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 40,
                        width: '100%',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          backgroundColor: 'rgba(255,165,0,0.92)',
                          color: '#1b1b1b',
                          fontWeight: '800',
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 10,
                        }}>
                        👀 Nháy mắt 1 cái
                      </Text>
                    </View>
                  )}
                </View>

                {/* Khung chữ nhật động */}
                <Animated.View style={boundingBoxStyle} />

                {cameraPaused && (
                  <Text style={styles.bannerPaused}>Camera is PAUSED</Text>
                )}
              </>
            )}

            {!cameraMounted && (
              <Text style={styles.bannerNotMounted}>Camera is NOT mounted</Text>
            )}
          </>
        ) : (
          <Text style={styles.bannerNoPerm}>
            No camera device or permission
          </Text>
        )}
      </View>

      {/* Gallery thumbnails + nút xoá */}
      <View style={styles.galleryBar}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>Ảnh đã chụp</Text>
          <Button title="Xoá hết ảnh" onPress={clearAllPhotos} />
        </View>

        <FlatList
          data={photos}
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 12}}
          renderItem={({item}) => (
            <TouchableOpacity activeOpacity={0.8} style={styles.thumbWrap}>
              <Image
                source={{
                  uri: item.startsWith('file://') ? item : `file://${item}`,
                }}
                style={styles.thumb}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ảnh</Text>}
        />
      </View>

      {/* Cụm nút điều khiển */}
      <View style={styles.controls}>
        <View style={styles.row}>
          <Button
            onPress={() =>
              setCameraFacing(c => (c === 'front' ? 'back' : 'front'))
            }
            title={'Toggle Cam'}
          />
          <Button
            onPress={() => setAutoMode(c => !c)}
            title={`${autoMode ? 'Disable' : 'Enable'} AutoMode`}
          />
        </View>
        <View style={styles.row}>
          <Button
            onPress={() => setCameraPaused(c => !c)}
            title={`${cameraPaused ? 'Resume' : 'Pause'} Cam`}
          />
          <Button
            onPress={() => setCameraMounted(c => !c)}
            title={`${cameraMounted ? 'Unmount' : 'Mount'} Cam`}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  guideContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    position: 'absolute',
    bottom: 60,
    textAlign: 'center',
    paddingHorizontal: 12,
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  bannerPaused: {
    width: '100%',
    backgroundColor: 'rgb(0,0,255)',
    textAlign: 'center',
    color: 'white',
  },
  bannerNotMounted: {
    width: '100%',
    backgroundColor: 'rgb(255,255,0)',
    textAlign: 'center',
  },
  bannerNoPerm: {
    width: '100%',
    backgroundColor: 'rgb(255,0,0)',
    textAlign: 'center',
    color: 'white',
  },
  galleryBar: {position: 'absolute', left: 0, right: 0, bottom: 110},
  galleryHeader: {
    paddingHorizontal: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryTitle: {
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  thumbWrap: {
    width: 70,
    height: 70,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#00000055',
  },
  thumb: {width: '100%', height: '100%'},
  emptyText: {color: '#fff', opacity: 0.9},
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
});

export default function FaceDetectionScreen() {
  return (
    <SafeAreaProvider>
      <FaceDetection />
    </SafeAreaProvider>
  );
}
