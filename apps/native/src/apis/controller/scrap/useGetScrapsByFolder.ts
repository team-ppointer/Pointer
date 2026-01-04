import { TanstackQueryClient } from '@apis';
import { paths } from '@/types/api/schema';

type GetScrapsByFolderResponse =
  paths['/api/student/scrap/folder/{folderId}/scraps']['get']['responses']['200']['content']['*/*'];

/**
 * 폴더 내 스크랩 목록 조회
 * @description 특정 폴더에 속한 스크랩 목록을 조회합니다.
 */
export const useGetScrapsByFolder = (folderId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/folder/{folderId}/scraps',
    {
      params: {
        path: { folderId },
      },
    },
    {
      enabled: enabled && !!folderId,
    }
  );
};

