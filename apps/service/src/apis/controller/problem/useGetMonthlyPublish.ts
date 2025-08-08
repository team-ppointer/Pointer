import { TanstackQueryClient } from '@apis';

type Props = {
  year: number;
  month: number;
  enabled?: boolean;
};

const useGetMonthlyPublish = ({ year, month, enabled = true }: Props) => {
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
      enabled: enabled,
    }
  );
};

export default useGetMonthlyPublish;
