import { TanstackQueryClient } from '@apis';

const useGetProblemTeacherById = (publishId: number, problemId: number, studentId: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/problem/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: publishId,
          problemId: problemId,
        },
        query: {
          studentId: studentId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: problemId >= 0 && publishId >= 0,
    }
  );
};

export default useGetProblemTeacherById;
