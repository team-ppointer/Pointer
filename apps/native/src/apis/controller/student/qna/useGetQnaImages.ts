import { TanstackQueryClient } from '@apis';

type Props = {
  enabled?: boolean;
};

const useGetQnaImages = ({ enabled = true }: Props = {}) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/images',
    {},
    { enabled }
  );
};

export default useGetQnaImages;
