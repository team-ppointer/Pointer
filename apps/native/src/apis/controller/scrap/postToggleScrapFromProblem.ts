import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type ToggleScrapFromProblemRequest =
  paths['/api/student/scrap/toggle/from-problem']['post']['requestBody']['content']['application/json'];
type ToggleScrapFromProblemResponse =
  paths['/api/student/scrap/toggle/from-problem']['post']['responses']['200']['content']['*/*'];

export const useToggleScrapFromProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: ToggleScrapFromProblemRequest
    ): Promise<ToggleScrapFromProblemResponse> => {
      const { data } = await client.POST('/api/student/scrap/toggle/from-problem', {
        body: request,
      });
      return data as ToggleScrapFromProblemResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
