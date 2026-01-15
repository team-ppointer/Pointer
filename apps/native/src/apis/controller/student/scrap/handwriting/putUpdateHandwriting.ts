import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@schema';

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
    onSuccess: (_, { scrapId }) => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'handwriting', scrapId] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'detail', scrapId] });
    },
  });
};
