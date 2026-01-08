import { TanstackQueryClient } from '@/apis/client';

type Props = {
  qnaId: number;
  enabled?: boolean;
};

const useGetQnaFilesById = ({ qnaId, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/{qnaId}/files',
    {
      params: {
        path: { qnaId },
      },
    },
    { enabled }
  );
};

export default useGetQnaFilesById;
