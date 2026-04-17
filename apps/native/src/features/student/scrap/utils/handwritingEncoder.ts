import { type Stroke, type TextBoxData } from './skia';
import type { StrokeSample } from '@repo/pointer-native-drawing';

export interface HandwritingData {
  strokes: Stroke[];
  texts: TextBoxData[];
  lastColor?: string;
}

// ---------------------------------------------------------------------------
// Binary format constants
// ---------------------------------------------------------------------------

const BINARY_VERSION = 1;
const FLAG_HAS_TEXTS = 0x01;
const FLAG_HAS_LAST_COLOR = 0x02;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function writeStr(
  view: DataView,
  bytes: Uint8Array,
  offset: number,
  str: string,
): number {
  const encoded = textEncoder.encode(str);
  view.setUint16(offset, encoded.length, true);
  bytes.set(encoded, offset + 2);
  return offset + 2 + encoded.length;
}

function readStr(
  view: DataView,
  buffer: ArrayBuffer,
  offset: number,
): [string, number] {
  const len = view.getUint16(offset, true);
  const str = textDecoder.decode(new Uint8Array(buffer, offset + 2, len));
  return [str, offset + 2 + len];
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(
      String.fromCharCode.apply(
        null,
        bytes.subarray(i, Math.min(i + CHUNK, bytes.length)) as unknown as number[],
      ),
    );
  }
  return btoa(parts.join(''));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const bin = atob(base64);
  const buf = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return buf;
}

// ---------------------------------------------------------------------------
// Binary encode
// ---------------------------------------------------------------------------

function encodeBinary(
  strokes: Stroke[],
  texts: TextBoxData[],
  lastColor?: string,
): string {
  // Build color table
  const colorSet = new Set<string>();
  for (const s of strokes) colorSet.add(s.color);
  const colorTable = Array.from(colorSet);
  const colorMap = new Map<string, number>();
  colorTable.forEach((c, i) => colorMap.set(c, i));

  const flags =
    (texts.length > 0 ? FLAG_HAS_TEXTS : 0) |
    (lastColor ? FLAG_HAS_LAST_COLOR : 0);

  // Pre-compute total size
  let size = 8; // header: version(1) + flags(1) + strokeCount(4) + colorTableSize(2)

  // Color table
  for (const c of colorTable) size += 2 + textEncoder.encode(c).length;

  // Strokes
  for (const s of strokes) {
    const pc = s.points instanceof Float64Array ? s.points.length / 2 : s.points.length;
    const sc = s.samples
      ? s.samples instanceof Float64Array ? s.samples.length / 8 : s.samples.length
      : 0;
    // colorIdx(2) + width(4) + opacity(4) + strokeCap(1) + pointCount(4)
    size += 15;
    size += pc * 8; // points: float32 × 2
    size += 4; // sampleCount
    if (sc > 0) {
      size += 8; // baseTimestamp: float64
      size += sc * 32; // samples: float32 × 8
    }
  }

  // TextBoxes
  if (texts.length > 0) {
    size += 2; // count
    for (const t of texts) {
      size += 2 + textEncoder.encode(t.id).length;
      size += 20; // x,y,w,h,fontSize: 5 × float32
      size += 2 + textEncoder.encode(t.text).length;
      size += 2 + textEncoder.encode(t.color).length;
    }
  }

  if (lastColor) size += 2 + textEncoder.encode(lastColor).length;

  // Fill buffer
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let o = 0;

  // Header
  view.setUint8(o, BINARY_VERSION); o += 1;
  view.setUint8(o, flags); o += 1;
  view.setUint32(o, strokes.length, true); o += 4;
  view.setUint16(o, colorTable.length, true); o += 2;

  // Color table
  for (const c of colorTable) o = writeStr(view, bytes, o, c);

  // Strokes
  for (const s of strokes) {
    view.setUint16(o, colorMap.get(s.color)!, true); o += 2;
    view.setFloat32(o, s.width, true); o += 4;
    view.setFloat32(o, s.opacity ?? 1.0, true); o += 4;
    view.setUint8(o, s.strokeCap === 'butt' ? 1 : 0); o += 1;

    const isPacked = s.points instanceof Float64Array;
    const pc = isPacked ? (s.points as Float64Array).length / 2 : (s.points as any[]).length;
    view.setUint32(o, pc, true); o += 4;
    if (isPacked) {
      const pts = s.points as Float64Array;
      for (let i = 0; i < pc; i++) {
        view.setFloat32(o, pts[i * 2], true); o += 4;
        view.setFloat32(o, pts[i * 2 + 1], true); o += 4;
      }
    } else {
      const pts = s.points as { x: number; y: number }[];
      for (let i = 0; i < pc; i++) {
        view.setFloat32(o, pts[i].x, true); o += 4;
        view.setFloat32(o, pts[i].y, true); o += 4;
      }
    }

    const sIsPacked = s.samples instanceof Float64Array;
    const sc = sIsPacked ? (s.samples as Float64Array).length / 8 : (s.samples as any[] | undefined)?.length ?? 0;
    view.setUint32(o, sc, true); o += 4;
    if (sc > 0) {
      if (sIsPacked) {
        const sam = s.samples as Float64Array;
        const baseTs = sam[7]; // first sample timestamp at stride offset 7
        view.setFloat64(o, baseTs, true); o += 8;
        for (let i = 0; i < sc; i++) {
          const off = i * 8;
          view.setFloat32(o, sam[off], true); o += 4;     // x
          view.setFloat32(o, sam[off + 1], true); o += 4; // y
          view.setFloat32(o, sam[off + 2], true); o += 4; // pressure
          view.setFloat32(o, sam[off + 3], true); o += 4; // tiltX
          view.setFloat32(o, sam[off + 4], true); o += 4; // tiltY
          view.setFloat32(o, sam[off + 5], true); o += 4; // velocity
          view.setFloat32(o, sam[off + 6], true); o += 4; // smoothedVelocity
          view.setFloat32(o, sam[off + 7] - baseTs, true); o += 4; // deltaTs
        }
      } else {
        const sam = s.samples as StrokeSample[];
        const baseTs = sam[0].timestamp;
        view.setFloat64(o, baseTs, true); o += 8;
        for (let i = 0; i < sc; i++) {
          view.setFloat32(o, sam[i].x, true); o += 4;
          view.setFloat32(o, sam[i].y, true); o += 4;
          view.setFloat32(o, sam[i].pressure ?? NaN, true); o += 4;
          view.setFloat32(o, sam[i].tiltX ?? NaN, true); o += 4;
          view.setFloat32(o, sam[i].tiltY ?? NaN, true); o += 4;
          view.setFloat32(o, sam[i].velocity ?? NaN, true); o += 4;
          view.setFloat32(o, sam[i].smoothedVelocity ?? NaN, true); o += 4;
          view.setFloat32(o, sam[i].timestamp - baseTs, true); o += 4;
        }
      }
    }
  }

  // TextBoxes
  if (texts.length > 0) {
    view.setUint16(o, texts.length, true); o += 2;
    for (const t of texts) {
      o = writeStr(view, bytes, o, t.id);
      view.setFloat32(o, t.x, true); o += 4;
      view.setFloat32(o, t.y, true); o += 4;
      view.setFloat32(o, t.width, true); o += 4;
      view.setFloat32(o, t.height, true); o += 4;
      view.setFloat32(o, t.fontSize, true); o += 4;
      o = writeStr(view, bytes, o, t.text);
      o = writeStr(view, bytes, o, t.color);
    }
  }

  if (lastColor) o = writeStr(view, bytes, o, lastColor);

  return arrayBufferToBase64(buffer);
}

// ---------------------------------------------------------------------------
// Binary decode
// ---------------------------------------------------------------------------

function decodeBinary(base64Data: string): HandwritingData {
  const buffer = base64ToArrayBuffer(base64Data);
  const view = new DataView(buffer);
  let o = 0;

  // Header
  const version = view.getUint8(o); o += 1;
  if (version !== BINARY_VERSION)
    throw new Error(`Unknown binary version: ${version}`);
  const flags = view.getUint8(o); o += 1;
  const strokeCount = view.getUint32(o, true); o += 4;
  const colorTableSize = view.getUint16(o, true); o += 2;

  const hasTexts = (flags & FLAG_HAS_TEXTS) !== 0;
  const hasLastColor = (flags & FLAG_HAS_LAST_COLOR) !== 0;

  // Color table
  const colorTable: string[] = [];
  for (let i = 0; i < colorTableSize; i++) {
    let c: string;
    [c, o] = readStr(view, buffer, o);
    colorTable.push(c);
  }

  // Strokes
  const strokes: Stroke[] = [];
  for (let i = 0; i < strokeCount; i++) {
    const colorIdx = view.getUint16(o, true); o += 2;
    const width = view.getFloat32(o, true); o += 4;
    const opacity = view.getFloat32(o, true); o += 4;
    const capByte = view.getUint8(o); o += 1;

    const pc = view.getUint32(o, true); o += 4;
    const points = new Float64Array(pc * 2);
    for (let j = 0; j < pc; j++) {
      points[j * 2] = view.getFloat32(o, true); o += 4;
      points[j * 2 + 1] = view.getFloat32(o, true); o += 4;
    }

    const sc = view.getUint32(o, true); o += 4;
    let samples: Float64Array | undefined;
    if (sc > 0) {
      const baseTs = view.getFloat64(o, true); o += 8;
      samples = new Float64Array(sc * 8);
      for (let j = 0; j < sc; j++) {
        const off = j * 8;
        samples[off] = view.getFloat32(o, true); o += 4;     // x
        samples[off + 1] = view.getFloat32(o, true); o += 4; // y
        samples[off + 2] = view.getFloat32(o, true); o += 4; // pressure (NaN if absent)
        samples[off + 3] = view.getFloat32(o, true); o += 4; // tiltX
        samples[off + 4] = view.getFloat32(o, true); o += 4; // tiltY
        samples[off + 5] = view.getFloat32(o, true); o += 4; // velocity
        samples[off + 6] = view.getFloat32(o, true); o += 4; // smoothedVelocity
        samples[off + 7] = baseTs + view.getFloat32(o, true); o += 4; // timestamp
      }
    }

    const stroke: Stroke = {
      points,
      color: colorTable[colorIdx] ?? '#000000',
      width,
      ...(opacity !== 1.0 ? { opacity } : {}),
      ...(capByte === 1 ? { strokeCap: 'butt' as const } : {}),
      ...(samples ? { samples } : {}),
    };
    strokes.push(stroke);
  }

  // TextBoxes
  let texts: TextBoxData[] = [];
  if (hasTexts) {
    const count = view.getUint16(o, true); o += 2;
    texts = new Array(count);
    for (let i = 0; i < count; i++) {
      let id: string, text: string, color: string;
      [id, o] = readStr(view, buffer, o);
      const x = view.getFloat32(o, true); o += 4;
      const y = view.getFloat32(o, true); o += 4;
      const w = view.getFloat32(o, true); o += 4;
      const h = view.getFloat32(o, true); o += 4;
      const fontSize = view.getFloat32(o, true); o += 4;
      [text, o] = readStr(view, buffer, o);
      [color, o] = readStr(view, buffer, o);
      texts[i] = { id, x, y, width: w, height: h, text, fontSize, color };
    }
  }

  // LastColor
  let lastColor: string | undefined;
  if (hasLastColor) {
    [lastColor, o] = readStr(view, buffer, o);
  }

  return { strokes, texts, ...(lastColor ? { lastColor } : {}) };
}

// ---------------------------------------------------------------------------
// Legacy JSON decode (backwards compatibility)
// ---------------------------------------------------------------------------

function decodeJSON(base64Data: string): HandwritingData {
  const decodedData = decodeURIComponent(escape(atob(base64Data)));
  const data = JSON.parse(decodedData);

  if (Array.isArray(data)) {
    return { strokes: data, texts: [] };
  }

  // TextBoxData migration: width/height fallback for old TextItem format
  const texts: TextBoxData[] = (data.texts || []).map((t: any) => ({
    id: t.id,
    x: t.x ?? 0,
    y: t.y ?? 0,
    width: t.width ?? 200,
    height: t.height ?? 0,
    text: t.text ?? '',
    fontSize: t.fontSize ?? 16,
    color: t.color ?? '#1E1E21',
  }));

  return {
    strokes: data.strokes || [],
    texts,
    ...(data.lastColor ? { lastColor: data.lastColor } : {}),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * 필기 데이터를 binary → base64로 인코딩합니다.
 * JSON.stringify 대비 ~10x 빠르고, payload ~60% 절감.
 */
export function encodeHandwritingData(
  strokes: Stroke[],
  texts: TextBoxData[],
  lastColor?: string,
): string {
  return encodeBinary(strokes || [], texts || [], lastColor);
}

/**
 * Base64 인코딩된 필기 데이터를 디코딩합니다.
 * binary(v1) / JSON 포맷 자동 감지.
 */
export function decodeHandwritingData(base64Data: string): HandwritingData {
  try {
    // Auto-detect: binary starts with version byte (0x01),
    // JSON/base64 starts with '{' (0x7B) or '[' (0x5B)
    const firstByte = atob(base64Data.slice(0, 4)).charCodeAt(0);
    if (firstByte === BINARY_VERSION) {
      return decodeBinary(base64Data);
    }
    return decodeJSON(base64Data);
  } catch (error) {
    console.error('필기 데이터 디코딩 실패:', error);
    throw error;
  }
}

/**
 * 두 필기 데이터가 동일한지 비교합니다.
 */
export function isSameHandwritingData(data1: string, data2: string): boolean {
  return data1 === data2;
}
