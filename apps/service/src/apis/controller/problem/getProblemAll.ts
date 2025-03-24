import { $api } from '@/apis/client';

type GetProblemAllProps = {
  year: number;
  month: number;
};

const getProblemAll = ({ year, month }: GetProblemAllProps) =>
  $api.useQuery('get', '/api/v1/client/problem/all/{year}/{month}', {
    params: {
      path: {
        year,
        month,
      },
    },
  });

export default getProblemAll;
