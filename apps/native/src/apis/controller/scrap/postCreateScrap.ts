import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type CreateScrapRequest =
  paths['/api/student/scrap']['post']['requestBody']['content']['application/json'];
type CreateScrapResponse =
  paths['/api/student/scrap']['post']['responses']['200']['content']['*/*'];

export const useCreateScrap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateScrapRequest): Promise<CreateScrapResponse> => {
      const { data } = await client.POST('/api/student/scrap', {
        body: request,
      });
      return data as CreateScrapResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
