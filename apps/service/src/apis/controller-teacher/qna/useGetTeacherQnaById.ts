import { TanstackQueryClient } from '@/apis/client';

const useGetTeacherQnaById = (qnaId: number) => {
  return TanstackQueryClient.useQuery('get', '/api/teacher/qna/{qnaId}', {
    params: { path: { qnaId } },
    enabled: qnaId > 0,
  });
};

export default useGetTeacherQnaById;
