import { TanstackQueryClient } from '@/apis/client';

const useGetEntireProblemPointing = (problemId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/pointing/entire/{problemId}',
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

export default useGetEntireProblemPointing;
