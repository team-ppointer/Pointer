import { TanstackQueryClient } from '@apis';

const useGetStudentWeeklyPublish = (studentId: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/publish/weekly',
    {
      params: {
        query: {
          studentId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: studentId > 0,
    }
  );
};

export default useGetStudentWeeklyPublish;
