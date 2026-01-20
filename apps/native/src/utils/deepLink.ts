/**
 * 딥링크 URL 파싱 유틸리티
 * 
 * FCM 알림이나 알림 API에서 넘어오는 URL을 파싱하여
 * 적절한 네비게이션 대상을 결정합니다.
 * 
 * 지원 형식:
 * - /qna/{qnaId}: QnA 채팅방으로 이동
 * - /publish/{publishId}: 문제 풀이 화면으로 이동
 */

export type DeepLinkType = 'qna' | 'publish' | 'unknown';

export interface ParsedDeepLink {
  type: DeepLinkType;
  id: number | null;
  rawUrl: string;
}

/**
 * 딥링크 URL을 파싱합니다.
 * @param url - 파싱할 URL (예: "/qna/39" 또는 "/publish/123")
 * @returns 파싱된 딥링크 정보
 */
export const parseDeepLinkUrl = (url: string | undefined | null): ParsedDeepLink => {
  if (!url) {
    return { type: 'unknown', id: null, rawUrl: '' };
  }

  const trimmedUrl = url.trim();

  // /qna/{qnaId} 형식 매칭
  const qnaMatch = trimmedUrl.match(/^\/qna\/(\d+)$/);
  if (qnaMatch) {
    const id = parseInt(qnaMatch[1], 10);
    return { type: 'qna', id: isNaN(id) ? null : id, rawUrl: trimmedUrl };
  }

  // /publish/{publishId} 형식 매칭
  const publishMatch = trimmedUrl.match(/^\/publish\/(\d+)$/);
  if (publishMatch) {
    const id = parseInt(publishMatch[1], 10);
    return { type: 'publish', id: isNaN(id) ? null : id, rawUrl: trimmedUrl };
  }

  return { type: 'unknown', id: null, rawUrl: trimmedUrl };
};

/**
 * 딥링크가 유효한지 확인합니다.
 */
export const isValidDeepLink = (parsed: ParsedDeepLink): boolean => {
  return parsed.type !== 'unknown' && parsed.id !== null && parsed.id > 0;
};
