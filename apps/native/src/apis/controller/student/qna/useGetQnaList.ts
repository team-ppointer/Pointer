import { TanstackQueryClient } from '@/apis/client';

type Props = {
  enabled?: boolean;
};

const useGetQnaList = ({ enabled = true }: Props = {}) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna',
    {},
    { enabled }
  );
};

export default useGetQnaList;
