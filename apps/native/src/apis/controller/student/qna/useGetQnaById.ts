import { TanstackQueryClient } from '@/apis/client';

type Props = {
  qnaId: number;
  enabled?: boolean;
};

const useGetQnaById = ({ qnaId, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/{qnaId}',
    {
      params: {
        path: { qnaId },
      },
    },
    { enabled }
  );
};

export default useGetQnaById;
