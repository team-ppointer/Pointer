import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UpdateScrapNameRequest =
  paths['/api/student/scrap/{scrapId}/name']['put']['requestBody']['content']['application/json'];
type UpdateScrapNameResponse =
  paths['/api/student/scrap/{scrapId}/name']['put']['responses']['200']['content']['*/*'];

interface UpdateScrapNameParams {
  scrapId: number;
  request: UpdateScrapNameRequest;
}

export const useUpdateScrapName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scrapId,
      request,
    }: UpdateScrapNameParams): Promise<UpdateScrapNameResponse> => {
      const { data } = await client.PUT('/api/student/scrap/{scrapId}/name', {
        params: {
          path: { scrapId },
        },
        body: request,
      });
      return data as UpdateScrapNameResponse;
    },
    onSuccess: (_, { scrapId }) => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'detail', scrapId] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'search'] });
    },
  });
};
