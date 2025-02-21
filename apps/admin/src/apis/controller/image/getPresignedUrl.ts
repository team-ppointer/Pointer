import { $api } from '@apis';
import { ImageType } from '@types';

interface getPresignedUrlParams {
  problemId: string;
  imageType: ImageType;
}

const getPresignedUrl = ({ problemId, imageType }: getPresignedUrlParams) => {
  return $api.useQuery(
    'get',
    '/api/v1/images/problem/{problemId}/presigned-url',
    {
      params: {
        path: {
          problemId: problemId,
        },
        query: {
          'image-type': imageType,
        },
      },
    },
    {
      enabled: false,
    }
  );
};

export default getPresignedUrl;
