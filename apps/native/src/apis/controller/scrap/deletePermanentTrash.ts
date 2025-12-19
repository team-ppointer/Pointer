import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

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
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/trash').queryKey,
      });
    },
  });
};
