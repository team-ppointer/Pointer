import { type Stroke, type TextBoxData } from './skia';

export interface HandwritingData {
  strokes: Stroke[];
  texts: TextBoxData[];
  lastColor?: string;
}

/**
 * Float64Array stroke를 JSON-safe 객체로 변환
 */
function strokeToJSON(stroke: Stroke): Record<string, unknown> {
  let points: { x: number; y: number }[];
  if (stroke.points instanceof Float64Array) {
    const buf = stroke.points;
    const len = buf.length / 2;
    points = Array.from({ length: len }, (_, i) => ({
      x: buf[i * 2],
      y: buf[i * 2 + 1],
    }));
  } else {
    points = stroke.points;
  }

  let samples: Record<string, unknown>[] | undefined;
  if (stroke.samples) {
    if (stroke.samples instanceof Float64Array) {
      const buf = stroke.samples;
      const count = buf.length / 8;
      samples = Array.from({ length: count }, (_, i) => {
        const off = i * 8;
        const p = buf[off + 2];
        const tx = buf[off + 3];
        const ty = buf[off + 4];
        const v = buf[off + 5];
        const sv = buf[off + 6];
        return {
          x: buf[off],
          y: buf[off + 1],
          ...(isNaN(p) ? {} : { pressure: p }),
          ...(isNaN(tx) ? {} : { tiltX: tx }),
          ...(isNaN(ty) ? {} : { tiltY: ty }),
          ...(isNaN(v) ? {} : { velocity: v }),
          ...(isNaN(sv) ? {} : { smoothedVelocity: sv }),
          timestamp: buf[off + 7],
        };
      });
    } else {
      samples = stroke.samples as Record<string, unknown>[];
    }
  }

  return {
    points,
    color: stroke.color,
    width: stroke.width,
    ...(stroke.opacity !== undefined ? { opacity: stroke.opacity } : {}),
    ...(stroke.strokeCap !== undefined ? { strokeCap: stroke.strokeCap } : {}),
    ...(samples ? { samples } : {}),
  };
}

/**
 * 필기 데이터를 Base64로 인코딩합니다.
 */
export function encodeHandwritingData(
  strokes: Stroke[],
  texts: TextBoxData[],
  lastColor?: string
): string {
  const data = {
    strokes: (strokes || []).map(strokeToJSON),
    texts: texts || [],
    ...(lastColor ? { lastColor } : {}),
  };
  const jsonString = JSON.stringify(data);
  return btoa(
    encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Base64로 인코딩된 필기 데이터를 디코딩합니다.
 * @throws 디코딩 실패 시 에러
 */
export function decodeHandwritingData(base64Data: string): HandwritingData {
  try {
    // Auto-detect: binary format starts with version byte 0x01
    const firstByte = atob(base64Data.slice(0, 4)).charCodeAt(0);
    if (firstByte === 0x01) {
      console.warn('Binary handwriting data detected, resetting to empty');
      return { strokes: [], texts: [] };
    }

    const binary = atob(base64Data);
    const decodedData = decodeURIComponent(
      binary.replace(/[\s\S]/g, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    );
    const data = JSON.parse(decodedData);

    // 이전 형식 호환성: strokes만 있는 경우와 { strokes, texts } 형식 모두 지원
    if (Array.isArray(data)) {
      return { strokes: data, texts: [] };
    }

    // TextBoxData migration: width/height fallback for old TextItem format
    const texts: TextBoxData[] = (data.texts || []).map((t: Record<string, unknown>) => ({
      id: t.id,
      x: (t.x as number) ?? 0,
      y: (t.y as number) ?? 0,
      width: (t.width as number) ?? 200,
      height: (t.height as number) ?? 0,
      text: (t.text as string) ?? '',
      fontSize: (t.fontSize as number) ?? 16,
      color: (t.color as string) ?? '#1E1E21',
    }));

    return {
      strokes: data.strokes || [],
      texts,
      ...(data.lastColor ? { lastColor: data.lastColor } : {}),
    };
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
