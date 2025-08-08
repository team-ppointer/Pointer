import { TanstackQueryClient } from '@/apis/client';

const useGetQnaList = (search?: string) => {
  const response = TanstackQueryClient.useQuery('get', '/api/student/qna', {
    params: { query: { query: search } },
  });
  return response;
};
export default useGetQnaList;
