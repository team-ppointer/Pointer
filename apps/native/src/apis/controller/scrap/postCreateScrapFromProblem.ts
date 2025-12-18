import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type CreateScrapFromProblemRequest =
  paths['/api/student/scrap/from-problem']['post']['requestBody']['content']['application/json'];
type CreateScrapFromProblemResponse =
  paths['/api/student/scrap/from-problem']['post']['responses']['200']['content']['*/*'];

export const useCreateScrapFromProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: CreateScrapFromProblemRequest
    ): Promise<CreateScrapFromProblemResponse> => {
      const { data } = await client.POST('/api/student/scrap/from-problem', {
        body: request,
      });
      return data as CreateScrapFromProblemResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
    },
  });
};
