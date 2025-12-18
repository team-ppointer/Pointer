import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type ToggleScrapFromPointingRequest =
  paths['/api/student/scrap/toggle/from-pointing']['post']['requestBody']['content']['application/json'];
type ToggleScrapFromPointingResponse =
  paths['/api/student/scrap/toggle/from-pointing']['post']['responses']['200']['content']['*/*'];

export const useToggleScrapFromPointing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: ToggleScrapFromPointingRequest
    ): Promise<ToggleScrapFromPointingResponse> => {
      const { data } = await client.POST('/api/student/scrap/toggle/from-pointing', {
        body: request,
      });
      return data as ToggleScrapFromPointingResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
