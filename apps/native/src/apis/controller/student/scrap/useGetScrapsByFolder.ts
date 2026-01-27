import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@schema';

type GetScrapsByFolderParams =
  paths['/api/student/scrap/folder/{folderId}/scraps']['get']['parameters']['path'];

type GetScrapsByFolderQueryParams =
  paths['/api/student/scrap/folder/{folderId}/scraps']['get']['parameters']['query'];

/**
 * 폴더 내 스크랩 목록 조회
 * @description 특정 폴더에 속한 스크랩 목록을 조회합니다.
 */
export const useGetScrapsByFolder = (
  params: GetScrapsByFolderParams,
  queryParams?: GetScrapsByFolderQueryParams,
  enabled = true
) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/folder/{folderId}/scraps',
    {
      params: {
        path: params,
        query: queryParams,
      },
    },
    {
      enabled,
    }
  );
};
