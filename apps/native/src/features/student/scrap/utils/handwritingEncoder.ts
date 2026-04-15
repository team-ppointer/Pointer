import { type Stroke, type TextBoxData } from './skia';

export interface HandwritingData {
  strokes: Stroke[];
  texts: TextBoxData[];
  lastColor?: string;
}

/**
 * 필기 데이터를 Base64로 인코딩합니다.
 * @param strokes - 그리기 스트로크 배열
 * @param texts - 텍스트 아이템 배열
 * @returns Base64로 인코딩된 문자열
 */
export function encodeHandwritingData(strokes: Stroke[], texts: TextBoxData[], lastColor?: string): string {
  const data: HandwritingData = {
    strokes: strokes || [],
    texts: texts || [],
    ...(lastColor ? { lastColor } : {}),
  };
  const jsonString = JSON.stringify(data);
  const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
  return base64Data;
}

/**
 * Base64로 인코딩된 필기 데이터를 디코딩합니다.
 * @param base64Data - Base64로 인코딩된 문자열
 * @returns 디코딩된 필기 데이터 (strokes, texts)
 * @throws 디코딩 실패 시 에러
 */
export function decodeHandwritingData(base64Data: string): HandwritingData {
  try {
    const decodedData = decodeURIComponent(escape(atob(base64Data)));
    const data = JSON.parse(decodedData);

    // 이전 형식 호환성: strokes만 있는 경우와 { strokes, texts } 형식 모두 지원
    if (Array.isArray(data)) {
      // 이전 형식: strokes 배열만
      return {
        strokes: data,
        texts: [],
      };
    } else {
      // 새 형식: { strokes, texts } 객체
      return {
        strokes: data.strokes || [],
        texts: data.texts || [],
      };
    }
  } catch (error) {
    console.error('필기 데이터 디코딩 실패:', error);
    throw error;
  }
}

/**
 * 두 필기 데이터가 동일한지 비교합니다.
 * @param data1 - 첫 번째 Base64 인코딩된 데이터
 * @param data2 - 두 번째 Base64 인코딩된 데이터
 * @returns 동일 여부
 */
export function isSameHandwritingData(data1: string, data2: string): boolean {
  return data1 === data2;
}
