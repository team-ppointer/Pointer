import { TanstackQueryClient } from '@apis';

const useGetChildProblemTeacherById = (
  publishId: number,
  childProblemId: number,
  studentId: number
) => {
  console.log('useGetChildProblemTeacherById', publishId, childProblemId, studentId);
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/child-problem/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: publishId,
          problemId: childProblemId,
        },
        query: {
          studentId: studentId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: childProblemId >= 0,
    }
  );
};

export default useGetChildProblemTeacherById;
