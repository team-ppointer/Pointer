import { TanstackQueryClient } from '@apis';

/**
 * Q&A 내가 참여한 모든 이미지 조회 (최신순)
 */
export const useGetQnaAllImages = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/qna/images');
};
