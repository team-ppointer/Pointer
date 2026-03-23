import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type components } from '@schema';

import { invalidateScrapMutationQueries } from './utils';

import { client } from '@/apis/client';

type ScrapFromOneStepMoreCreateRequest = components['schemas']['ScrapFromOneStepMoreCreateRequest'];
type ScrapToggleResp = components['schemas']['ScrapToggleResp'];

export const useToggleScrapFromOneStepMore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ScrapFromOneStepMoreCreateRequest): Promise<ScrapToggleResp> => {
      const { data } = await client.POST('/api/student/scrap/toggle/from-one-step-more', {
        body: request,
      });
      return data as ScrapToggleResp;
    },
    onSuccess: () => {
      // 검색 및 최근 스크랩 쿼리 갱신
      invalidateScrapMutationQueries(queryClient);
    },
  });
};
