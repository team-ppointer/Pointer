import { TanstackQueryClient } from '@apis';

/**
 * Q&A 전체 이미지 조회 (질문 + 채팅)
 * @param qnaId - Q&A ID
 * @param enabled - 쿼리 활성화 여부
 */
export const useGetQnaImages = (qnaId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/{qnaId}/images',
    {
      params: {
        path: { qnaId },
      },
    },
    {
      enabled,
    }
  );
};
