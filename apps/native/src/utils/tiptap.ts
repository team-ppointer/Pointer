import type { JSONNode } from '@repo/pointer-content-renderer';

const EMPTY_DOC: JSONNode = { type: 'doc', content: [] };

/**
 * 서버의 JSON string 을 안전하게 `JSONNode` 로 파싱. 실패/빈 입력 시
 * `{ type: 'doc', content: [] }` 반환 (절대 throw 하지 않음).
 */
export function parseTipTapDoc(raw?: string | null): JSONNode {
  if (raw == null || raw === '') return EMPTY_DOC;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      typeof (parsed as { type: unknown }).type === 'string'
    ) {
      return parsed as JSONNode;
    }
    return EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}
