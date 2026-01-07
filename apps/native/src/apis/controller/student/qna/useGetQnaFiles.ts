import { TanstackQueryClient } from '@/apis/client';

type Props = {
  enabled?: boolean;
};

const useGetQnaFiles = ({ enabled = true }: Props = {}) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/files',
    {},
    { enabled }
  );
};

export default useGetQnaFiles;

