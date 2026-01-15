import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';
import {
  invalidateFolderScrapsQueries,
  invalidateScrapMutationQueries,
  SCRAP_QUERY_KEYS,
} from './utils';

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
        queryKey: SCRAP_QUERY_KEYS.scrapDetail(scrapId),
      });
      // 폴더 내 스크랩 목록, 최근 스크랩, 검색 결과 갱신
      invalidateFolderScrapsQueries(queryClient);
      invalidateScrapMutationQueries(queryClient);
    },
  });
};
