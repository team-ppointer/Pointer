import { TanstackQueryClient } from '@/apis/client';

const useGetTeacherQnaList = (search?: string) => {
  const response = TanstackQueryClient.useQuery('get', '/api/teacher/qna', {
    params: { query: { query: search } },
  });
  return response;
};
export default useGetTeacherQnaList;
