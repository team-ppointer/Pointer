import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type CreateScrapFromPointingRequest =
  paths['/api/student/scrap/from-pointing']['post']['requestBody']['content']['application/json'];
type CreateScrapFromPointingResponse =
  paths['/api/student/scrap/from-pointing']['post']['responses']['200']['content']['*/*'];

export const useCreateScrapFromPointing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: CreateScrapFromPointingRequest
    ): Promise<CreateScrapFromPointingResponse> => {
      const { data } = await client.POST('/api/student/scrap/from-pointing', {
        body: request,
      });
      return data as CreateScrapFromPointingResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
