import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/apis/client';
import { type paths } from '@schema';

import { invalidateScrapMutationQueries } from './utils';

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
      // 검색 및 최근 스크랩 쿼리 갱신
      invalidateScrapMutationQueries(queryClient);
    },
  });
};
