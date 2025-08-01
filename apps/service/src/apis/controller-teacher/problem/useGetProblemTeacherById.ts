import { TanstackQueryClient } from '@apis';

type Props = {
  publishId: number;
  problemId: number;
  studentId: number;
  enabled?: boolean;
};

const useGetProblemTeacherById = ({ publishId, problemId, studentId, enabled = true }: Props) => {
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
      enabled: enabled,
    }
  );
};

export default useGetProblemTeacherById;
