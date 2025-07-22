import { TanstackQueryClient } from '@/apis/client';
import { components } from '@schema';

const useGetQnaExist = (props: components['schemas']['QnACheckRequest']) => {
  return TanstackQueryClient.useQuery('post', '/api/student/qna/exist', {
    body: { ...props },
  });
};

export default useGetQnaExist;
