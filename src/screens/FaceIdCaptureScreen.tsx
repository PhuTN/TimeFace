import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  useWindowDimensions,
  Image,
  FlatList,
  ActivityIndicator,
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
} from 'react-native-vision-camera-face-detector';

// Canvas & Path để vẽ elip
import {Canvas, Path, Skia, ClipOp, TileMode} from '@shopify/react-native-skia';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// >>> Face-ID utils
import {getFaceIdFromFile, l2Normalize, cosineSim} from '../utils/face-id-utils';

type FitState = 'ok' | 'tooSmall' | 'tooBig' | 'offCenter';
type Verdict = 'unknown' | 'likely_paper_or_screen' | 'likely_real';

// Chế độ thao tác Face ID
type Mode = 'idle' | 'enroll' | 'recognize';

// Kiểu dữ liệu lưu embedding
type SavedFace = { id: string; name: string; emb: Float32Array };

// Ảnh có nhãn để hiển thị ID trên đầu
type LabeledPhoto = { uri: string; label: string };

function FaceIdCapture() {
  const {width, height} = useWindowDimensions();
  const {hasPermission, requestPermission} = useCameraPermission();

  // --- State/refs cho gallery & chụp tự động ---
  const [photos, setPhotos] = useState<LabeledPhoto[]>([]);
  const captureLock = useRef<boolean>(false);
  const actionLock = useRef<boolean>(false); // KHÓA toàn chu kỳ chụp+onnx
  const captureTimeout = useRef<NodeJS.Timeout | null>(null);

  const [cameraMounted, setCameraMounted] = useState<boolean>(false); // camera ẩn mặc định
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>('front');

  // >>> Trạng thái Face ID
  const [mode, setMode] = useState<Mode>('idle');
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Sẵn sàng');
  const [savedFaces, setSavedFaces] = useState<SavedFace[]>([]);
  const [lastResult, setLastResult] = useState<{name: string; score: number} | null>(null);

  // Ngưỡng nhận diện demo
  const RECOG_THRESHOLD = 0.40;

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

  // === 2D detection params ===
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

  // === Planarity check ===
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

  // đặt bên trong component FaceIdCapture
const resetPipelines = () => {
  // reset refs/buffers
  stableFramesRef.current = 0;
  trackBuf.current = [];
  voteBuf.current = [];
  landBuf.current = [];
  planarVotesBuf.current = [];
  blinkEvents.current = [];
  lastEyeState.current = { l: true, r: true, count: 0 };

  // reset UI/indicator
  aFaceW.value = 0;
  aFaceH.value = 0;
  aFaceX.value = 0;
  aFaceY.value = 0;
  setFitState('offCenter');
  setVerdict('unknown');
  setDebugInfo('');
  setNeedBlink(false);

  // unlock capture cycle
  actionLock.current = false;
  captureLock.current = false;
  if (captureTimeout.current) {
    clearTimeout(captureTimeout.current);
    captureTimeout.current = null;
  }
};


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
  function affineRmse(pointsP:{x:number;y:number}[], pointsQ:{x:number;y:number}[]) {
    const n = Math.min(pointsP.length, pointsQ.length);
    if (n < 8) return {rmse: 1e9};
    const X:number[][] = [], b:number[] = [];
    for (let i=0;i<n;i++){
      const p = pointsP[i], q = pointsQ[i];
      X.push([p.x,p.y,1,0,0,0]); X.push([0,0,0,p.x,p.y,1]);
      b.push(q.x,q.y);
    }
    const Xt = X[0].map((_, j) => X.map(r => r[j]));
    const XtX = Xt.map(r => Array(Xt[0].length).fill(0));
    for (let i=0;i<Xt.length;i++) for (let k=0;k<X.length;k++){
      const aik = Xt[i][k]; for (let j=0;j<Xt[0].length;j++) XtX[i][j]+=aik*X[k][j];
    }
    const Xtb = Xt.map(row => row.reduce((s, ai, i) => s + ai * b[i], 0));
    function solve6(A:number[][], y:number[]){
      const n=6, M=A.map(r=>r.slice()), v=y.slice();
      for (let i=0;i<n;i++){
        let piv=i; for (let r=i+1;r<n;r++) if (Math.abs(M[r][i])>Math.abs(M[piv][i])) piv=r;
        if (Math.abs(M[piv][i])<1e-8) return null;
        if (piv!==i){ [M[i],M[piv]]=[M[piv],M[i]]; [v[i],v[piv]]=[v[piv],v[i]]; }
        const d=M[i][i]; for (let j=i;j<n;j++) M[i][j]/=d; v[i]/=d;
        for (let r=0;r<n;r++) if (r!==i){ const f=M[r][i]; if(f!==0){ for(let j=i;j<n;j++) M[r][j]-=f*M[i][j]; v[r]-=f*v[i]; } }
      }
      return v;
    }
    const a = solve6(XtX, Xtb); if(!a) return {rmse:1e9};
    let se=0;
    for (let i=0;i<n;i++){
      const p=pointsP[i], q=pointsQ[i];
      const x2=a[0]*p.x + a[1]*p.y + a[2];
      const y2=a[3]*p.x + a[4]*p.y + a[5];
      se += (x2-q.x)*(x2-q.x) + (y2-q.y)*(y2-q.y);
    }
    return {rmse: Math.sqrt(se/n)};
  }

  // === Blink & Pose rigidity ===
  const BLINK_PROB_THR = 0.35;
  const BLINK_MIN_DURATION = 1;
  const BLINK_WINDOW_MS = 6000;
  const blinkEvents = useRef<number[]>([]);
  const lastEyeState = useRef<{l: boolean; r: boolean; count: number}>({
    l: true, r: true, count: 0,
  });
  const RIGID_MOVE_MIN_PIX = 12;
  const POSE_VAR_THR = 2.0;
  const RATIO_VAR_THR = 0.01;

  const [needBlink, setNeedBlink] = useState<boolean>(false);

  function getFitState(bounds:{x:number;y:number;width:number;height:number;}): FitState {
    const {x, y, width: bw, height: bh} = bounds;
    const k = ELLIPSE_MARGIN;
    const rx2 = GUIDE_RX * k * (GUIDE_RX * k);
    const ry2 = GUIDE_RY * k * (GUIDE_RY * k);

    const points = [
      {px: x, py: y}, {px: x + bw, py: y},
      {px: x, py: y + bh}, {px: x + bw, py: y + bh},
      {px: x + bw / 2, py: y}, {px: x + bw / 2, py: y + bh},
      {px: x, py: y + bh / 2}, {px: x + bw, py: y + bh / 2},
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

  // === CHỤP 1 LẦN — KHÔNG thêm ảnh ở đây
  async function tryAutoCapture() {
    if (captureLock.current || actionLock.current || !camera.current) return;

    try {
      captureLock.current = true;
      actionLock.current = true; // khóa cả chu kỳ chụp + xử lý

      const photo = await (camera.current as any).takePhoto?.({
        qualityPrioritization: 'balanced',
        skipMetadata: false,
      });

      if (photo?.path) {
        const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
        const currentMode = mode; // chốt mode ngay lúc chụp
        if (currentMode !== 'idle') {
          await handleAfterShot(uri, currentMode);
        }
      }
    } catch (e) {
      console.warn('takePhoto failed', e);
    } finally {
      if (captureTimeout.current) clearTimeout(captureTimeout.current);
      captureTimeout.current = setTimeout(() => {
        captureLock.current = false;
        actionLock.current = false;
      }, 1200);
    }
  }

  // >>> xử lý sau khi chụp theo mode
  async function handleAfterShot(fileUri: string, actMode: Mode) {
    try {
      setBusy(true);
      setStatus(actMode === 'enroll' ? 'Đang trích xuất & lưu khuôn mặt...' : 'Đang trích xuất & nhận diện...');

      let emb = await getFaceIdFromFile({ filePath: fileUri });
      emb = l2Normalize(emb);

      if (actMode === 'enroll') {
        const id = Date.now().toString();
        const short = id.slice(-6);
        const name = `Face ${savedFaces.length + 1}`;
        setSavedFaces(prev => [...prev, { id, name, emb }]);
        setLastResult(null);
        setStatus(` Đã lưu: ${name} (ID ${short})`);

        // => Gắn label ID/Name lên đầu ảnh ENROLL (NHẬN DIỆN sẽ không lưu ảnh)
        setPhotos(prev => [{ uri: fileUri, label: `${name} • ${short}` }, ...prev]);
      } else if (actMode === 'recognize') {
        if (savedFaces.length === 0) {
          setStatus('⚠️ Danh sách trống. Hãy lưu khuôn mặt trước.');
          setLastResult(null);
          // ⛔ KHÔNG lưu ảnh vào gallery khi nhận diện
        } else {
          let best = { name: '', score: -1 };
          for (const f of savedFaces) {
            const s = cosineSim(emb, f.emb);
            if (s > best.score) best = { name: f.name, score: s };
          }
          if (best.score >= RECOG_THRESHOLD) {
            setStatus(` Nhận diện: ${best.name} (score=${best.score.toFixed(3)})`);
            setLastResult(best);
          } else {
            setStatus(`❌ Không khớp ai (max=${best.score.toFixed(3)})`);
            setLastResult(null);
          }
          // ⛔ KHÔNG lưu ảnh vào gallery khi nhận diện
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus(' Lỗi xử lý: ' + (err?.message ?? 'unknown'));
      setLastResult(null);
      // ⛔ Không thêm ảnh khi lỗi trong nhận diện; enroll lỗi cũng không thêm
    } finally {
      setBusy(false);
      setMode('idle');          // tránh chụp tiếp
      setCameraMounted(false);  // ✅ Ẩn camera sau khi xong 1 lần
      setCameraPaused(true);
    }
  }

  function handleFacesDetected(faces: Face[], frame: Frame): void {
    if (faces.length <= 0) {
      aFaceW.value = 0; aFaceH.value = 0; aFaceX.value = 0; aFaceY.value = 0;
      stableFramesRef.current = 0;
      setFitState('offCenter');

      trackBuf.current = [];
      landBuf.current = [];
      pushVote(false);
      pushPlanarVote(false);
      setDebugInfo('no face');
      setNeedBlink(false);
      return;
    }

    const face = faces[0];
    const {bounds, contours} = face;
    const {width: bw, height: bh, x, y} = bounds;

    // vẽ khung chữ nhật
    aFaceW.value = bw; aFaceH.value = bh; aFaceX.value = x; aFaceY.value = y;

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
    aFaceX.value = x; aFaceY.value = y;
    const cy = bounds.y + bounds.height / 2;
    const ratio = bounds.width / Math.max(1, bounds.height);
    const area = bounds.width * bounds.height;

    const buf = trackBuf.current;
    const prev =
      (buf as any).findLast?.((t:Track) => Math.abs(yaw - t.yaw) >= PARALLAX_MIN_YAW_DELTA) ||
      [...buf].reverse().find(t => Math.abs(yaw - t.yaw) >= PARALLAX_MIN_YAW_DELTA);

    let parallaxLooks2D = false;
    if (prev) {
      const prevArea = prev.w * prev.h;
      const areaChange = Math.abs(area - prevArea) / Math.max(area, prevArea);
      if (areaChange <= PARALLAX_AREA_STABLE) parallaxLooks2D = true;
    }

    buf.push({ t: Date.now(), cx, cy, w: bounds.width, h: bounds.height, yaw, pitch, roll, ratio });
    if (buf.length > 40) buf.shift();

    // 3) Planarity (affine fit)
    const currPts = collectFacePoints(contours);
    let isPlanarNow = false;
    if (currPts.length >= 12) {
      const prevL =
        (landBuf.current as any).findLast?.(
          (t:LandTrack) =>
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
      landBuf.current.push({ t: Date.now(), yaw, cx, cy, pts: currPts.slice(0, 160) });
      if (landBuf.current.length > 24) landBuf.current.shift();
    }

    // Pose/Aspect rigidity
    let rigidPose2D = false, rigidRatio2D = false;
    const recent = [...buf].slice(-10);
    if (recent.length >= 6) {
      const dx = Math.abs(recent[recent.length - 1].cx - recent[0].cx);
      const dy = Math.abs(recent[recent.length - 1].cy - recent[0].cy);
      const moved = Math.hypot(dx, dy) >= RIGID_MOVE_MIN_PIX;

      const yawVar = variance(recent.map(r => r.yaw));
      const pitchVar = variance(recent.map(r => r.pitch ?? recent[0].pitch ?? 0));
      const rollVar = variance(recent.map(r => r.roll ?? recent[0].roll ?? 0));
      rigidPose2D = moved && yawVar < POSE_VAR_THR && pitchVar < POSE_VAR_THR && rollVar < POSE_VAR_THR;

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
    const lOpen = typeof face.leftEyeOpenProbability === 'number' ? face.leftEyeOpenProbability : 1;
    // @ts-ignore
    const rOpen = typeof face.rightEyeOpenProbability === 'number' ? face.rightEyeOpenProbability : 1;
    const lClosed = lOpen < BLINK_PROB_THR, rClosed = rOpen < BLINK_PROB_THR;

    if (lClosed && rClosed) {
      lastEyeState.current.count += 1;
    } else {
      if (lastEyeState.current.count >= BLINK_MIN_DURATION) {
        blinkEvents.current.push(now);
        if (blinkEvents.current.length > 10) blinkEvents.current.shift();
      }
      lastEyeState.current.count = 0;
    }
    while (blinkEvents.current.length && now - blinkEvents.current[0] > BLINK_WINDOW_MS) {
      blinkEvents.current.shift();
    }
    const hasRecentBlink = blinkEvents.current.length > 0;

    // tổng hợp phán quyết
    const spoofLike = flatEdge || parallaxLooks2D || isPlanarNow || rigidPose2D || rigidRatio2D;
    pushVote(spoofLike);

    const planarVotes = planarVotesBuf.current.reduce((a, b) => a + b, 0);
    setDebugInfo(
      `straight=${straightRatio.toFixed(2)} curv=${meanCurvature.toFixed(3)} `
      + `yaw=${yaw.toFixed(1)} parallax2D=${parallaxLooks2D ? 1 : 0} planarVotes=${planarVotes} `
      + `rigidPose=${rigidPose2D ? 1 : 0} rigidRatio=${rigidRatio2D ? 1 : 0} blink=${hasRecentBlink ? 1 : 0}`,
    );

    // đánh giá trạng thái khớp elip
    const state = getFitState(bounds);
    setFitState(state);

    // === Chỉ hiện “Nháy mắt 1 cái” khi cần blink
    const strong2D = verdict === 'likely_paper_or_screen' || planarVotes >= PLANAR_VOTES_THR || rigidPose2D || rigidRatio2D;
    if (state === 'ok' && !strong2D && !hasRecentBlink) setNeedBlink(true);
    else setNeedBlink(false);

    if (state === 'ok') {
      stableFramesRef.current += 1;
      if (stableFramesRef.current >= STABLE_FRAMES) {
        if (isCameraActive && cameraMounted && !cameraPaused) {
          if (!strong2D && hasRecentBlink) {
            if ((mode === 'enroll' || mode === 'recognize') && !actionLock.current) {
              tryAutoCapture();
            }
          }
        }
        stableFramesRef.current = 0;
      }
    } else {
      stableFramesRef.current = 0;
    }
  }

  // Skia (tuỳ chọn – giữ blur/viền như gốc)
  function handleSkiaActions(faces: Face[], frame: DrawableFrame): void {
    'worklet';
    if (faces.length <= 0) return;

    const {bounds, contours} = faces[0];

    const blurRadius = 20;
    const blurFilter = Skia.ImageFilter.MakeBlur(blurRadius, blurRadius, TileMode.Decal, null);
    const blurPaint = Skia.Paint();
    blurPaint.setImageFilter(blurFilter);
    const contourPath = Skia.Path.Make();
    const necessaryContours: (keyof Contours)[] = ['FACE','LEFT_CHEEK','RIGHT_CHEEK'];
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

  // ====== 3 NÚT THEO YÊU CẦU ======
  const onPressEnroll = () => {
    setStatus('Bật camera để LƯU khuôn mặt. Đưa mặt vào elip và nháy mắt…');
    setLastResult(null);
    setMode('enroll');
    setCameraMounted(true);     // ✅ Chỉ hiện camera khi bấm
    setCameraPaused(false);
  };

  const onPressRecognize = () => {
    setStatus('Bật camera để NHẬN DIỆN. Đưa mặt vào elip và nháy mắt…');
    setMode('recognize');
    setCameraMounted(true);     // ✅ Chỉ hiện camera khi bấm
    setCameraPaused(false);
  };
const onPressClearList = () => {
  // nếu đang bận xử lý ONNX thì bỏ qua để tránh xung đột
  if (busy) return;

  setSavedFaces([]);
  setPhotos([]);           // << xoá gallery
  setLastResult(null);
  setMode('idle');
  setStatus('Đã xoá danh sách & ảnh');
  setCameraMounted(false); // << ẩn camera để reset sạch
  setCameraPaused(true);

  resetPipelines();        // << reset toàn bộ buffers/locks
};


 return (
  <>
    {/* CAMERA + OVERLAY */}
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000', // nền đen cho sạch
        },
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
                  autoMode: true,
                  cameraFacing,
                }}
              />

              {/* Overlay: khung elip hướng dẫn */}
              <View pointerEvents="none" style={[styles.guideContainer, {width, height}]}>
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
                        ? 'rgba(74,222,128,0.95)' // xanh lá
                        : fitState === 'tooSmall'
                        ? 'rgba(250,204,21,0.95)'
                        : fitState === 'tooBig'
                        ? 'rgba(248,113,113,0.95)'
                        : 'rgba(255,255,255,0.9)';
                    return (
                      <Path
                        path={path}
                        style="stroke"
                        strokeWidth={4}
                        color={strokeColor}
                      />
                    );
                  })()}
                </Canvas>

                <Text style={styles.guideText}>
                  {fitState === 'ok' &&
                    (mode === 'enroll'
                      ? 'Giữ yên — chuẩn bị chụp để LƯU…'
                      : mode === 'recognize'
                      ? 'Giữ yên — chuẩn bị chụp để NHẬN DIỆN…'
                      : 'Giữ nguyên trong elip')}
                  {fitState === 'tooSmall' && 'Lại gần camera hơn'}
                  {fitState === 'tooBig' && 'Lùi ra xa một chút'}
                  {fitState === 'offCenter' && 'Căn giữa khuôn mặt trong elip'}
                </Text>

                {/* Thông báo 2D/3D + debug (đã chuyển xuống dưới card) */}
                {/* <View style={styles.verdictContainer}>
                  <Text
                    style={[
                      styles.verdictBadge,
                      verdict === 'likely_paper_or_screen'
                        ? {backgroundColor: 'rgba(220,38,38,0.9)'}
                        : verdict === 'likely_real'
                        ? {backgroundColor: 'rgba(22,163,74,0.9)'}
                        : {backgroundColor: 'rgba(82,82,91,0.9)'},
                    ]}>
                    {verdict === 'likely_paper_or_screen' &&
                      '⚠️ Nghi là ảnh/màn hình đặt trước camera'}
                    {verdict === 'likely_real' && '✅ Có vẻ mặt thật (3D)'}
                    {verdict === 'unknown' && 'Đang kiểm tra 2D/3D…'}
                  </Text>
                  <Text style={styles.debugText}>{debugInfo}</Text>
                </View> */}

                {/* Banner yêu cầu blink */}
                {needBlink && (
                  <View style={styles.blinkBanner}>
                    <Text style={styles.blinkText}>👀 Nháy mắt 1 cái</Text>
                  </View>
                )}
              </View>

              {/* Khung chữ nhật động */}
              <Animated.View style={boundingBoxStyle} />

              {/* Loading xử lý ONNX */}
              {busy && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{color: '#fff', marginTop: 10, fontWeight: '600'}}>
                    Đang xử lý…
                  </Text>
                </View>
              )}

              {cameraPaused && <Text style={styles.bannerPaused}>Camera đang tạm dừng</Text>}
            </>
          )}

          {!cameraMounted && (
            <View style={styles.bannerWrapper}>
              <Text style={styles.bannerNotMounted}>Camera chưa mount</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.bannerWrapper}>
          <Text style={styles.bannerNoPerm}>Thiếu quyền truy cập camera</Text>
        </View>
      )}
    </View>

    {/* Thanh trạng thái top */}
    <View style={styles.statusWrapper}>
      <Text style={styles.statusBadge}>{status}</Text>
    </View>

    {/* Card dưới: Gallery + kết quả */}
    <View style={styles.bottomPanel}>
      {/* Header + kết quả */}
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryTitle}>Ảnh đã chụp</Text>
        <Text style={styles.gallerySubtitle}>
          Đã lưu: {savedFaces.length}
          {lastResult ? ` • ${lastResult.name} (${lastResult.score.toFixed(3)})` : ''}
        </Text>
      </View>

      {/* Log nhỏ: 2D/3D + debug */}
    {/* Log nhỏ: 2D/3D + debug — chỉ hiện khi đã fitting OK */}
{fitState === 'ok' && (
  <>
    <View style={styles.logRow}>
      <Text style={styles.logLabel}>Trạng thái 2D/3D:</Text>
      <Text
        style={[
          styles.logBadge,
          verdict === 'likely_paper_or_screen'
            ? {backgroundColor: 'rgba(220,38,38,0.9)'}
            : verdict === 'likely_real'
            ? {backgroundColor: 'rgba(22,163,74,0.9)'}
            : {backgroundColor: 'rgba(82,82,91,0.9)'},
        ]}>
        {verdict === 'likely_paper_or_screen' && '⚠️ Nghi là ảnh/màn hình'}
        {verdict === 'likely_real' && '✅ Có vẻ mặt thật (3D)'}
        {verdict === 'unknown' && 'Đang kiểm tra…'}r
      </Text>
    </View>

    {Boolean(debugInfo) && (
      <Text style={styles.logDebug} numberOfLines={2}>
        {debugInfo}
      </Text>
    )}
  </>
)}
     
      <FlatList
        data={photos}
        keyExtractor={(item, idx) => `${item.uri}-${idx}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 4}}
        renderItem={({item}) => (
          <View style={styles.thumbWrap}>
            <Image
              source={{
                uri: item.uri.startsWith('file://') ? item.uri : `file://${item.uri}`,
              }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={styles.thumbLabel}>
              <Text style={styles.thumbLabelText} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có ảnh • Chụp thử một tấm 😁</Text>
        }
      />

      {/* Cụm 3 nút điều khiển */}
      <View style={styles.controls}>
        {/* Nhóm chính */}
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.mainButton, {backgroundColor: '#22c55e'}]}
            onPress={onPressEnroll}>
            <Text style={styles.mainButtonText}>Lưu khuôn mặt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.mainButton, {backgroundColor: '#3b82f6'}]}
            onPress={onPressRecognize}>
            <Text style={styles.mainButtonText}>Nhận diện</Text>
          </TouchableOpacity>
        </View>

        {/* Nhóm phụ */}
        <View style={[styles.row, {marginTop: 10}]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryButton}
            onPress={() => setCameraFacing(c => (c === 'front' ? 'back' : 'front'))}>
            <Text style={styles.secondaryButtonText}>Đổi camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryButtonDanger}
            onPress={onPressClearList}>
            <Text style={styles.secondaryButtonText}>Xoá danh sách</Text>
          </TouchableOpacity>
        </View>
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
    bottom: 80,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  verdictContainer: {
    position: 'absolute',
    bottom: 150,
    width: '100%',
    alignItems: 'center',
  },
  verdictBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
    overflow: 'hidden',
  },
  debugText: {
    color: '#e5e5e5',
    opacity: 0.8,
    marginTop: 4,
    fontSize: 11,
  },
  blinkBanner: {
    position: 'absolute',
    top: 40,
    width: '100%',
    alignItems: 'center',
  },
  blinkText: {
    backgroundColor: 'rgba(251,191,36,0.95)',
    color: '#1b1b1b',
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  bannerWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bannerPaused: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(37,99,235,0.95)',
    textAlign: 'center',
    color: 'white',
    paddingVertical: 6,
    fontWeight: '600',
  },
  bannerNotMounted: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(250,204,21,0.95)',
    borderRadius: 999,
    textAlign: 'center',
    color: '#111827',
    fontWeight: '600',
  },
  bannerNoPerm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239,68,68,0.95)',
    borderRadius: 999,
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  statusWrapper: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '600',
  },

  // BOTTOM PANEL
  bottomPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.92)', // kiểu card semi-transparent
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  galleryHeader: {
    marginBottom: 8,
  },
  galleryTitle: {
    fontWeight: '800',
    color: '#f9fafb',
    fontSize: 15,
  },
  gallerySubtitle: {
    marginTop: 2,
    color: '#e5e7eb',
    fontSize: 12,
    opacity: 0.9,
  },

  // LOG 2D/3D + DEBUG
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  logLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginRight: 6,
  },
  logBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    color: '#f9fafb',
    fontSize: 11,
    fontWeight: '700',
  },
  logDebug: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 6,
  },

  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  thumb: {width: '100%', height: '100%'},
  thumbLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  thumbLabelText: {
    color: '#f9fafb',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    color: '#e5e7eb',
    opacity: 0.85,
    fontSize: 12,
    paddingVertical: 8,
  },

  controls: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#f9fafb',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  secondaryButtonDanger: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,29,29,0.9)',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function FaceIdCaptureScreen() {
  return (
    <SafeAreaProvider>
      <FaceIdCapture />
    </SafeAreaProvider>
  );
}
