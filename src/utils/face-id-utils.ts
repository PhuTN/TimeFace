// src/utils/face-id-utils.ts
// ✅ Face ID glintr100.onnx (ArcFace 512-D) – tối ưu EP + warmup + buffer reuse + không block UI
import { Platform, InteractionManager } from 'react-native';
import RNFS from 'react-native-fs';
import { Skia } from '@shopify/react-native-skia';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

/* =============================
 * Config (glintr100)
 * ============================= */
const MODEL_NAME = 'glintr100.onnx';
const INPUT_W = 112;
const INPUT_H = 112;

const ANDROID_MODEL_PATHS = [
  MODEL_NAME,
  `models/${MODEL_NAME}`,
  `models_bundled/${MODEL_NAME}`,
  `insightface/antelopev2/${MODEL_NAME}`,
  `models/insightface/antelopev2/${MODEL_NAME}`,
];

const IOS_MODEL_PATHS = [
  MODEL_NAME,
  `models/${MODEL_NAME}`,
  `insightface/antelopev2/${MODEL_NAME}`,
];

async function ensureModelFile(): Promise<string> {
  const cachePath = `${RNFS.CachesDirectoryPath}/${MODEL_NAME}`;
  try {
    const stat = await RNFS.stat(cachePath);
    if (stat.isFile()) return 'file://' + cachePath;
  } catch {}

  const candidates = Platform.OS === 'android' ? ANDROID_MODEL_PATHS : IOS_MODEL_PATHS;
  let lastError: unknown;
  for (const rel of candidates) {
    try {
      await RNFS.copyFileAssets(rel, cachePath);
      console.log('[FaceID] ✅ Copied model from assets:', rel);
      return 'file://' + cachePath;
    } catch (err) {
      lastError = err;
    }
  }
  console.error('[FaceID] ❌ Failed to find model in assets:', lastError);
  throw new Error(`Model not found in assets: tried ${candidates.join(', ')}`);
}

async function getModelPath(): Promise<string> {
  return ensureModelFile();
}
 
/* =============================
 * ONNX Session (singleton + EP fallback chain)
 * ============================= */
let _session: InferenceSession | null = null;
let _ioNames: { input: string; output: string } | null = null;

// EP ưu tiên theo nền tảng
function getPreferredEPs(): string[] {
  if (Platform.OS === 'ios') {
    // CoreML → XNNPACK → CPU
    return ['coreml', 'xnnpack', 'cpu'];
  }
  // Android: NNAPI → XNNPACK → CPU
  return ['nnapi', 'xnnpack', 'cpu'];
}

async function ensureSession(): Promise<InferenceSession> {
  if (_session) return _session;

  const modelPath = await getModelPath();
  const eps = getPreferredEPs();

  // Thử EP theo thứ tự ưu tiên, có thể có thiết bị không hỗ trợ một số EP
  let lastErr: any;
  for (const ep of eps) {
    try {
      console.log('[FaceID] 📦 Loading model with EP:', ep, 'from', modelPath);
      _session = await InferenceSession.create(modelPath, {
        executionProviders: [ep],
        // iOS CoreML: có thể tối ưu thêm:
        // enableMemPattern: false  // đôi khi giúp giảm RAM peak trên mobile
      } as any);
      console.log('[FaceID] ✅ Model loaded with EP:', ep);

      // Lấy tên input/output một lần
      const inputName =
        (_session as any).inputNames?.[0] ??
        Object.keys((( _session as any).inputMetadata ?? {}))[0] ?? 'data';
      const outputName =
        (_session as any).outputNames?.[0] ??
        Object.keys((( _session as any).outputMetadata ?? {}))[0];

      _ioNames = {
        input: inputName,
        output: outputName || inputName, // fallback
      };

      // Warm-up (giảm giật khung ở lần infer đầu)
      await warmUpOnce(_session, _ioNames.input);
      return _session;
    } catch (err) {
      console.warn('[FaceID] ⚠️ Failed EP:', ep, err);
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('Cannot create ONNX session');
}

async function warmUpOnce(session: InferenceSession, inputName: string) {
  try {
    const dummy = _getTensorPool().get(); // 1x3x112x112 float32 zero
    await session.run({ [inputName]: dummy.tensor });
    // Trả về pool để tái dùng
    _getTensorPool().release(dummy);
    console.log('[FaceID] 🔥 Warm-up done');
  } catch (e) {
    console.log('[FaceID] Warm-up skipped', e);
  }
}

/* =============================
 * Skia utils
 * ============================= */
type SkImageT = NonNullable<ReturnType<typeof Skia.Image.MakeImageFromEncoded>>;

async function loadSkiaImage(filePath: string): Promise<SkImageT> {
  // Nên truyền "file://..." từ phía gọi
  const data = await Skia.Data.fromURI(filePath);
  const img = Skia.Image.MakeImageFromEncoded(data);
  if (!img) throw new Error('Cannot load image: ' + filePath);
  return img;
}

/* =============================
 * Buffer/Tensor Pool – giảm GC & RAM peak
 * ============================= */
type TensorLease = { tensor: Tensor; buffer: Float32Array; inUse: boolean };
const _pool: TensorLease[] = [];
function _getTensorPool() {
  const shape = [1, 3, INPUT_H, INPUT_W];
  const len = 3 * INPUT_H * INPUT_W;
  return {
    get(): TensorLease {
      const free = _pool.find(p => !p.inUse);
      if (free) {
        free.inUse = true;
        // Không cần zero mỗi lần; nếu muốn an toàn thì fill(0)
        return free;
      }
      const buffer = new Float32Array(len);
      const tensor = new Tensor('float32', buffer, shape);
      const lease: TensorLease = { tensor, buffer, inUse: true };
      _pool.push(lease);
      return lease;
    },
    release(lease: TensorLease) {
      lease.inUse = false;
    },
  };
}

/* =============================
 * Warp image (center-crop + resize 112x112)
 * TIP: nếu bạn có 5 landmarks → dùng transform affine cho chuẩn hơn
 * ============================= */
function warpToInputRGBA(image: SkImageT): Uint8Array {
  // Dùng offscreen surface để nhờ GPU scale (Skia), sau đó readPixels
  const surface = Skia.Surface.MakeOffscreen(INPUT_W, INPUT_H);
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();

  const iw = image.width(), ih = image.height();
  const size = Math.min(iw, ih);
  const sx = (iw - size) / 2, sy = (ih - size) / 2;
  const srcRect = Skia.XYWHRect(sx, sy, size, size);
  const dstRect = Skia.XYWHRect(0, 0, INPUT_W, INPUT_H);

  canvas.clear(Skia.Color('black'));
  canvas.drawImageRect(image, srcRect, dstRect, paint, true);

  const snapshot = surface.makeImageSnapshot();
  const pixels = snapshot.readPixels() as Uint8Array | null;
  if (!pixels) throw new Error('Cannot read pixels');
  return pixels; // RGBA
}

/* =============================
 * Preprocess (ArcFace-style): CHW, (x-127.5)/128 – dùng pool buffer
 * ============================= */
function rgbaToCHWNormalized(pixelsRGBA: Uint8Array, buf: Float32Array) {
  const H = INPUT_H, W = INPUT_W;
  let rOff = 0, gOff = H * W, bOff = 2 * H * W, idx = 0;
  // Vòng lặp tight, hạn chế object alloc
  for (let y = 0; y < H; y++) {
    let base = y * W * 4;
    for (let x = 0; x < W; x++) {
      const p = base + (x << 2); // *4
      const r = pixelsRGBA[p], g = pixelsRGBA[p + 1], b = pixelsRGBA[p + 2];
      buf[rOff + idx] = (r - 127.5) / 128;
      buf[gOff + idx] = (g - 127.5) / 128;
      buf[bOff + idx] = (b - 127.5) / 128;
      idx++;
    }
  }
}

/* =============================
 * Postprocess helpers
 * ============================= */
export function l2Normalize(v: Float32Array): Float32Array {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  const n = Math.sqrt(s) || 1;
  for (let i = 0; i < v.length; i++) v[i] = v[i] / n;
  return v;
}

export function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

/* =============================
 * API công khai
 * ============================= */

// Gọi sớm ở chỗ bootstrap app để preload session + warmup
export async function preloadFaceIdModel() {
  await ensureSession();
}

// Chạy inference “không block UI”: phần tiền xử lý đợi sau animation/gesture
export async function getFaceIdFromFile(params: { filePath: string }) {
  // Tránh chặn UI: chờ đến khi animation/gestures xong (JS thread rảnh)
  await new Promise<void>(resolve =>
    InteractionManager.runAfterInteractions(() => resolve())
  );

  const session = await ensureSession();
  if (!_ioNames) throw new Error('I/O names not resolved');

  // Skia decode + GPU resize
  const img = await loadSkiaImage(params.filePath);
  const rgba = warpToInputRGBA(img);

  // Dùng pool để giảm GC
  const lease = _getTensorPool().get();
  try {
    rgbaToCHWNormalized(rgba, lease.buffer);

    // NCHW: 1x3x112x112
    const feeds: Record<string, Tensor> = { [_ioNames.input]: lease.tensor };
    const result = await session.run(feeds);

    const key = (_ioNames.output in result)
      ? _ioNames.output
      : Object.keys(result)[0];

    const emb = result[key].data as Float32Array; // 512-D
    return emb;
  } finally {
    _getTensorPool().release(lease);
  }
}
