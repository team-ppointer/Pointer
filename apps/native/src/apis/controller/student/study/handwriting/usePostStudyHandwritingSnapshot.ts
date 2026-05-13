import { useMutation } from '@tanstack/react-query';

import { type paths } from '@schema';
import { client } from '@/apis/client';

type SaveSnapshotRequest =
  paths['/api/student/study/problem/{publishId}/{problemId}/handwriting/snapshot']['post']['requestBody']['content']['application/json'];
type SaveSnapshotResponse =
  paths['/api/student/study/problem/{publishId}/{problemId}/handwriting/snapshot']['post']['responses']['200']['content']['*/*'];

interface SaveSnapshotParams {
  publishId: number;
  problemId: number;
  request: SaveSnapshotRequest;
}

export const usePostStudyHandwritingSnapshot = () => {
  return useMutation({
    mutationFn: async ({
      publishId,
      problemId,
      request,
    }: SaveSnapshotParams): Promise<SaveSnapshotResponse> => {
      const { data } = await client.POST(
        '/api/student/study/problem/{publishId}/{problemId}/handwriting/snapshot',
        {
          params: {
            path: { publishId, problemId },
          },
          body: request,
        }
      );
      return data as SaveSnapshotResponse;
    },
  });
};
