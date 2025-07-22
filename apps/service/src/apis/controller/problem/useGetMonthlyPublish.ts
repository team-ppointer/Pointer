import { TanstackQueryClient } from '@apis';

type Props = {
  year: number;
  month: number;
};

const useGetMonthlyPublish = ({ year, month }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/publish/monthly',
    {
      params: {
        query: { year: year, month: month },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetMonthlyPublish;
