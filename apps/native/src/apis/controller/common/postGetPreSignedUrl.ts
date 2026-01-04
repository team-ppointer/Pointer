import { useMutation } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetPreSignedUrlRequest =
  paths['/api/common/upload-file']['post']['requestBody']['content']['application/json'];
type GetPreSignedUrlResponse =
  paths['/api/common/upload-file']['post']['responses']['200']['content']['*/*'];

/**
 * 파일 업로드를 위한 Pre-signed URL 요청
 * @description AWS S3 업로드를 위한 pre-signed URL을 받아옵니다.
 */
export const useGetPreSignedUrl = () => {
  return useMutation({
    mutationFn: async (request: GetPreSignedUrlRequest): Promise<GetPreSignedUrlResponse> => {
      const { data } = await client.POST('/api/common/upload-file', {
        body: request,
      });
      return data as GetPreSignedUrlResponse;
    },
  });
};
