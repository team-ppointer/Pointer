import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/apis/client';
import { type paths } from '@schema';

import { invalidateScrapSearchQueries, SCRAP_QUERY_KEYS } from './utils';

type CreateFolderRequest =
  paths['/api/student/scrap/folder']['post']['requestBody']['content']['application/json'];
type CreateFolderResponse =
  paths['/api/student/scrap/folder']['post']['responses']['200']['content']['*/*'];

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateFolderRequest): Promise<CreateFolderResponse> => {
      const { data } = await client.POST('/api/student/scrap/folder', {
        body: request,
      });
      return data as CreateFolderResponse;
    },
    onSuccess: () => {
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.folderList(),
      });
      // 검색 결과 갱신
      invalidateScrapSearchQueries(queryClient);
    },
  });
};
