import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
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
      // 스크랩 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/{id}', {
          params: {
            path: { id: scrapId },
          },
        }).queryKey,
      });
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
