import { client } from '@/apis/client';

const postPointing = async (pointingId: number, isUnderstood: boolean, publishId?: number) => {
  return await client.POST('/api/student/study/submit/pointing', {
    body: {
      pointingId,
      isUnderstood,
      ...(publishId != null && { publishId }),
    },
  });
};

export default postPointing;
