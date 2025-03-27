import { TanstackQueryClient } from '@apis';

type GetCommentaryProps = {
  publishId: string;
  problemId: string;
};

const getCommentary = ({ publishId, problemId }: GetCommentaryProps) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/commentary',
    {
      params: {
        query: {
          publishId: Number(publishId),
          problemId: Number(problemId),
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default getCommentary;
