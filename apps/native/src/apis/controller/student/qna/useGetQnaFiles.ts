import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetQnaFilesParams = paths['/api/student/qna/files']['get']['parameters']['query'];

const useGetQnaFiles = (params: GetQnaFilesParams = {}, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/files',
    {
      params: {
        query: params,
      },
    },
    { enabled }
  );
};

export default useGetQnaFiles;
