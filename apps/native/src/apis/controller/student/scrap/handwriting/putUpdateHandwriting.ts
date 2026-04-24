import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type paths } from '@schema';
import { client, TanstackQueryClient } from '@/apis/client';

type UpdateHandwritingRequest =
  paths['/api/student/scrap/{scrapId}/handwriting']['put']['requestBody']['content']['application/json'];
type UpdateHandwritingResponse =
  paths['/api/student/scrap/{scrapId}/handwriting']['put']['responses']['200']['content']['*/*'];

interface UpdateHandwritingParams {
  scrapId: number;
  request: UpdateHandwritingRequest;
}

export const useUpdateHandwriting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scrapId,
      request,
    }: UpdateHandwritingParams): Promise<UpdateHandwritingResponse> => {
      const { data } = await client.PUT('/api/student/scrap/{scrapId}/handwriting', {
        params: {
          path: { scrapId },
        },
        body: request,
      });
      return data as UpdateHandwritingResponse;
    },
    onSuccess: (_, { scrapId, request }) => {
      queryClient.setQueryData(
        TanstackQueryClient.queryOptions('get', '/api/student/scrap/{scrapId}/handwriting', {
          params: { path: { scrapId } },
        }).queryKey,
        { data: request.data }
      );
    },
  });
};
