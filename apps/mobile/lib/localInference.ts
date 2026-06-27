/**
 * On-device YOLOv8 inference via ONNX Runtime.
 * Model is downloaded once from EXPO_PUBLIC_MODEL_URL and cached in the app's
 * document directory. Subsequent runs (including offline) use the cached file.
 */
import * as FileSystem from 'expo-file-system/legacy'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import type { InferenceSession } from 'onnxruntime-react-native'
import jpeg from 'jpeg-js'
import type { RawInference } from '@pinequest/core'

// onnxruntime-react-native is a custom native module that is NOT bundled in Expo Go.
// Import it lazily so the app boots in Expo Go (server-inference path works fine);
// the native module is only touched when on-device inference actually runs, which
// requires a dev/native build (build-order step 7).
const loadOnnx = () => import('onnxruntime-react-native')

const MODEL_FILENAME = 'screener_model.onnx'
const MODEL_PATH = `${FileSystem.documentDirectory}${MODEL_FILENAME}`
// Strip file:// prefix that onnxruntime-react-native doesn't accept
const MODEL_FS_PATH = MODEL_PATH.replace('file://', '')

const INPUT_SIZE = 640
const CONF_THRESHOLD = 0.25
const IOU_THRESHOLD = 0.45
const NUM_CLASSES = 4
const DISEASE_CLASSES = new Set([0, 1, 2])
const CLASS_NAMES = ['caries', 'cavity', 'crack', 'tooth']

let _session: InferenceSession | null = null

export const isModelCached = async (): Promise<boolean> => {
  const info = await FileSystem.getInfoAsync(MODEL_PATH)
  return info.exists && (info as { size?: number }).size! > 1_000_000
}

export const downloadModel = async (
  modelUrl: string,
  onProgress?: (pct: number) => void,
): Promise<void> => {
  if (await isModelCached()) return
  const dl = FileSystem.createDownloadResumable(
    modelUrl,
    MODEL_PATH,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) =>
      onProgress?.(totalBytesWritten / (totalBytesExpectedToWrite || 1)),
  )
  await dl.downloadAsync()
  // Reset session so next run loads the new file
  _session = null
}

const getSession = async (): Promise<InferenceSession> => {
  if (_session) return _session
  const { InferenceSession } = await loadOnnx()
  _session = await InferenceSession.create(MODEL_FS_PATH)
  return _session
}

const preprocessImage = async (uri: string): Promise<Float32Array> => {
  // 1. Resize to 640×640
  const resized = await manipulateAsync(
    uri,
    [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
    { format: SaveFormat.JPEG, compress: 1.0 },
  )

  // 2. Read as base64 then decode to raw RGBA bytes
  const b64 = await FileSystem.readAsStringAsync(resized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  const { data } = jpeg.decode(bytes, { useTArray: true })

  // 3. RGBA HWC → RGB CHW float32 normalized to [0, 1]
  const hw = INPUT_SIZE * INPUT_SIZE
  const tensor = new Float32Array(3 * hw)
  for (let i = 0; i < hw; i++) {
    tensor[i] = data[i * 4] / 255.0
    tensor[hw + i] = data[i * 4 + 1] / 255.0
    tensor[2 * hw + i] = data[i * 4 + 2] / 255.0
  }
  return tensor
}

const iou = (a: number[], b: number[]): number => {
  const ix1 = Math.max(a[0], b[0])
  const iy1 = Math.max(a[1], b[1])
  const ix2 = Math.min(a[2], b[2])
  const iy2 = Math.min(a[3], b[3])
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1)
  const union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
  return union > 0 ? inter / union : 0
}

const nms = (boxes: number[][], scores: number[]): number[] => {
  const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a])
  const kept: number[] = []
  const removed = new Set<number>()
  for (const i of order) {
    if (removed.has(i)) continue
    kept.push(i)
    for (const j of order) {
      if (j !== i && !removed.has(j) && iou(boxes[i], boxes[j]) > IOU_THRESHOLD)
        removed.add(j)
    }
  }
  return kept
}

/**
 * Run YOLOv8 inference locally and return a RawInference compatible with
 * normalizeInference() from @pinequest/core.
 */
export const runLocalInference = async (imageUri: string): Promise<RawInference> => {
  const sess = await getSession()
  const pixels = await preprocessImage(imageUri)

  const { Tensor } = await loadOnnx()
  const input = new Tensor('float32', pixels, [1, 3, INPUT_SIZE, INPUT_SIZE])
  const feeds = { [sess.inputNames[0]]: input }
  const outputs = await sess.run(feeds)
  const raw = outputs[sess.outputNames[0]]
  const data = raw.data as Float32Array
  const N = 8400 // anchor count for 640×640 (80²+40²+20²)

  const boxes: number[][] = []
  const scores: number[] = []
  const clsIds: number[] = []

  for (let a = 0; a < N; a++) {
    const cx = data[a]
    const cy = data[N + a]
    const w = data[2 * N + a]
    const h = data[3 * N + a]

    let maxScore = 0
    let bestCls = -1
    for (let c = 0; c < NUM_CLASSES; c++) {
      const s = data[(4 + c) * N + a]
      if (s > maxScore) { maxScore = s; bestCls = c }
    }

    if (maxScore < CONF_THRESHOLD || !DISEASE_CLASSES.has(bestCls)) continue

    // [cx, cy, w, h] in 640-pixel space → [x1, y1, x2, y2]
    boxes.push([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2])
    scores.push(maxScore)
    clsIds.push(bestCls)
  }

  const kept = nms(boxes, scores)

  return {
    detections: kept.map((i) => ({
      class_id: clsIds[i],
      class_name: CLASS_NAMES[clsIds[i]],
      confidence: scores[i],
      box: { x1: boxes[i][0], y1: boxes[i][1], x2: boxes[i][2], y2: boxes[i][3] },
    })),
    image_width: INPUT_SIZE,
    image_height: INPUT_SIZE,
  }
}
