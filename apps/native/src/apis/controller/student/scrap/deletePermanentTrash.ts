import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type paths } from '@schema';

import { SCRAP_QUERY_KEYS } from './utils';

import { client } from '@/apis/client';

type PermanentDeleteRequest =
  paths['/api/student/scrap/trash']['delete']['requestBody']['content']['application/json'];

export const usePermanentDeleteTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PermanentDeleteRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/trash', {
        body: request,
      });
    },
    onSuccess: () => {
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.trashList(),
      });
    },
  });
};
