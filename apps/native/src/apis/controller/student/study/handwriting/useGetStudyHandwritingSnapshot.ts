import { TanstackQueryClient } from '@/apis/client';
import { type components } from '@schema';

export type StudyHandwritingSnapshotType =
  components['schemas']['StudyHandwritingSnapshotSaveRequest']['type'];

export const useGetStudyHandwritingSnapshot = (
  publishId: number,
  problemId: number,
  type: StudyHandwritingSnapshotType,
  enabled = true
) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/problem/{publishId}/{problemId}/handwriting/snapshot/{type}',
    {
      params: {
        path: { publishId, problemId, type },
      },
    },
    {
      enabled,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
};
