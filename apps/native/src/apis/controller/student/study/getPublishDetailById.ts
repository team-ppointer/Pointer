import { client } from '@/apis/client';

const getPublishDetailById = async (publishId: number) => {
  const response = await client.GET('/api/student/study/publish/detail/{id}', {
    params: {
      path: {
        id: publishId,
      },
    },
  });
  return response.data ?? null;
};

export default getPublishDetailById;
