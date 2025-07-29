import { TanstackQueryClient } from '@apis';

const useGetStudentProgress = (studentId: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/progress/weekly',
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

export default useGetStudentProgress;
