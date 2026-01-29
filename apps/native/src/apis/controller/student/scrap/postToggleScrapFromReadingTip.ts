import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { components } from '@schema';
import { invalidateScrapMutationQueries } from './utils';

type ScrapFromReadingTipCreateRequest = components['schemas']['ScrapFromReadingTipCreateRequest'];
type ScrapToggleResp = components['schemas']['ScrapToggleResp'];

export const useToggleScrapFromReadingTip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ScrapFromReadingTipCreateRequest): Promise<ScrapToggleResp> => {
      const { data } = await client.POST('/api/student/scrap/toggle/from-reading-tip', {
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
