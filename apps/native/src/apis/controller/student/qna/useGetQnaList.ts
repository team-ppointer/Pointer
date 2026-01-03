import { TanstackQueryClient } from '@apis';

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
