import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type paths } from '@schema';

import { invalidateTrashMutationQueries, SCRAP_QUERY_KEYS } from './utils';

import { client } from '@/apis/client';

type RestoreTrashRequest =
  paths['/api/student/scrap/trash/restore']['put']['requestBody']['content']['application/json'];

export const useRestoreTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RestoreTrashRequest): Promise<void> => {
      await client.PUT('/api/student/scrap/trash/restore', {
        body: request,
      });
    },
    onSuccess: () => {
      // 휴지통 및 검색 쿼리 갱신
      invalidateTrashMutationQueries(queryClient);
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.folderList(),
      });
    },
  });
};
