import { TanstackQueryClient } from '@apis';

type Props = {
  publishId: number;
  problemId: number;
  enabled?: boolean;
};

const useGetProblem = ({ publishId, problemId, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/problem/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: publishId,
          problemId: problemId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: enabled,
    }
  );
};

export default useGetProblem;
