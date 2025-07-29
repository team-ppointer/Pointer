import { TanstackQueryClient } from '@apis';

type Props = {
  year: number;
  month: number;
  studentId: number;
};

const useGetMonthlyPublishByStudent = ({ year, month, studentId }: Props) => {
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
    }
  );
};

export default useGetMonthlyPublishByStudent;
