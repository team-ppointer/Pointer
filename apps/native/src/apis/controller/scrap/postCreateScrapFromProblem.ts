import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
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
      // 검색 결과 갱신 (모든 검색 쿼리 무효화)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === 'get' &&
            typeof key[1] === 'string' &&
            key[1].includes('/api/student/scrap/search')
          );
        },
      });
    },
  });
};
