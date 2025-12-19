import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
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
