import { TanstackQueryClient } from '@apis';

type Props = {
  year: number;
  month: number;
  studentId: number;
  enabled?: boolean;
};

const useGetMonthlyPublishByStudent = ({ year, month, studentId, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/publish/monthly',
    {
      params: {
        query: { year: year, month: month, studentId: studentId },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: enabled,
    }
  );
};

export default useGetMonthlyPublishByStudent;
