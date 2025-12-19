import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type CreateScrapFromImageRequest =
  paths['/api/student/scrap/from-image']['post']['requestBody']['content']['application/json'];
type CreateScrapFromImageResponse =
  paths['/api/student/scrap/from-image']['post']['responses']['200']['content']['*/*'];

export const useCreateScrapFromImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: CreateScrapFromImageRequest
    ): Promise<CreateScrapFromImageResponse> => {
      const { data } = await client.POST('/api/student/scrap/from-image', {
        body: request,
      });
      return data as CreateScrapFromImageResponse;
    },
    onSuccess: () => {
      // 검색 결과 갱신 (모든 검색 쿼리 무효화)
      // openapi-react-query의 queryKey 구조: ['get', '/api/student/scrap/search/all', { params: ... }]
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
