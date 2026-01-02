import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UpdateScrapTextRequest =
  paths['/api/student/scrap/{scrapId}/textBox']['put']['requestBody']['content']['application/json'];
type UpdateScrapTextResponse =
  paths['/api/student/scrap/{scrapId}/textBox']['put']['responses']['200']['content']['*/*'];

interface UpdateScrapTextParams {
  scrapId: number;
  request: UpdateScrapTextRequest;
}

export const useUpdateScrapText = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scrapId,
      request,
    }: UpdateScrapTextParams): Promise<UpdateScrapTextResponse> => {
      const { data } = await client.PUT('/api/student/scrap/{scrapId}/textBox', {
        params: {
          path: { scrapId },
        },
        body: request,
      });
      return data as UpdateScrapTextResponse;
    },
    onSuccess: (_, { scrapId }) => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'detail', scrapId] });
    },
  });
};
