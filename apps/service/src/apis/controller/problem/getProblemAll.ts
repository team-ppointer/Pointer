import client from '@/apis/client';

type GetProblemAllProps = {
  year: number;
  month: number;
};

const getProblemAll = async ({ year, month }: GetProblemAllProps) => {
  const { data } = await client.GET('/api/v1/client/problem/all/{year}/{month}', {
    params: {
      path: {
        year,
        month,
      },
    },
  });

  return data?.data;
};

export default getProblemAll;
