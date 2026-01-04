import { TanstackQueryClient } from '@/apis/client';

type Props = {
  qnaId: number;
  enabled?: boolean;
};

const useGetQnaImagesById = ({ qnaId, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/{qnaId}/images',
    {
      params: {
        path: { qnaId },
      },
    },
    { enabled }
  );
};

export default useGetQnaImagesById;
