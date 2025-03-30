import { TanstackQueryClient } from '@apis';

type UseGetCommentaryProps = {
  publishId: string;
  problemId: string;
};

const useGetCommentary = ({ publishId, problemId }: UseGetCommentaryProps) => {
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

export default useGetCommentary;
