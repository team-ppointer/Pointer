import { TanstackQueryClient } from '@apis';

type GetProblemAllProps = {
  year: number;
  month: number;
};

const getProblemAll = ({ year, month }: GetProblemAllProps) => {
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

export default getProblemAll;
