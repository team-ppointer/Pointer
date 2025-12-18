import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type MoveScrapsRequest =
  paths['/api/student/scrap/move']['put']['requestBody']['content']['application/json'];
type MoveScrapsResponse =
  paths['/api/student/scrap/move']['put']['responses']['200']['content']['*/*'];

export const useMoveScraps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: MoveScrapsRequest): Promise<MoveScrapsResponse> => {
      const { data } = await client.PUT('/api/student/scrap/move', {
        body: request,
      });
      return data as MoveScrapsResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
