import { TanstackQueryClient } from '@apis';

type useGetProblemAllProps = {
  year: number;
  month: number;
};

const useGetProblemAll = ({ year, month }: useGetProblemAllProps) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/problem/all/{year}/{month}',
    {
      params: {
        path: {
          year,
          month,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetProblemAll;
