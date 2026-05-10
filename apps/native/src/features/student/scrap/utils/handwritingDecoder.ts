import { type Stroke, type TextItem } from './skia/drawing';

export interface HandwritingData {
  strokes: Stroke[];
  texts: TextItem[];
}

type DecodeSource = {
  dataJson?: string | null;
  data?: string | null;
};

function parseHandwriting(jsonString: string): HandwritingData {
  const parsed = JSON.parse(jsonString);
  if (Array.isArray(parsed)) {
    return { strokes: parsed, texts: [] };
  }
  return {
    strokes: parsed.strokes ?? [],
    texts: parsed.texts ?? [],
  };
}

export function decodeHandwritingData(source: DecodeSource): HandwritingData {
  if (source.dataJson && source.dataJson.length > 0) {
    return parseHandwriting(source.dataJson);
  }
  if (source.data && source.data.length > 0) {
    const decoded = decodeURIComponent(escape(atob(source.data)));
    return parseHandwriting(decoded);
  }
  return { strokes: [], texts: [] };
}
