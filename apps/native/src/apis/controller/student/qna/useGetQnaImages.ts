import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetQnaImagesParams = paths['/api/student/qna/images']['get']['parameters']['query'];

const useGetQnaImages = (params: GetQnaImagesParams = {}, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/images',
    {
      params: {
        query: params,
      },
    },
    { enabled }
  );
};

export default useGetQnaImages;
