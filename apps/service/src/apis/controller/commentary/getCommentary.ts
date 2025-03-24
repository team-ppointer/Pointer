import { TanstackQueryClient } from '@/apis/client';

type GetCommentaryProps = {
  publishId: string;
  problemId: string;
};

const getCommentary = ({ publishId, problemId }: GetCommentaryProps) => {
  return TanstackQueryClient.useQuery('get', '/api/v1/client/commentary', {
    params: {
      query: {
        publishId: Number(publishId),
        problemId: Number(problemId),
      },
    },
  });
};

export default getCommentary;
