import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/apis/client';
import { type paths } from '@schema';

import { invalidateScrapMutationQueries } from './utils';

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
      // 검색 및 최근 스크랩 쿼리 갱신
      invalidateScrapMutationQueries(queryClient);
    },
  });
};
