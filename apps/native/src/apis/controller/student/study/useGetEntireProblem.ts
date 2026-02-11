import { TanstackQueryClient } from '@/apis/client';

const useGetEntireProblem = (problemId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/problem/entire/{problemId}',
    {
      params: {
        path: {
          problemId: problemId,
        },
      },
    },
    {
      enabled: enabled,
    }
  );
};

export default useGetEntireProblem;
