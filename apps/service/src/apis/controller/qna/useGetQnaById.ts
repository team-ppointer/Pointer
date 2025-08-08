import { TanstackQueryClient } from '@/apis/client';

const useGetQnaById = (qnaId: number) => {
  return TanstackQueryClient.useQuery('get', '/api/student/qna/{qnaId}', {
    params: {
      path: {
        qnaId: qnaId,
      },
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: qnaId > 0,
  });
};

export default useGetQnaById;
