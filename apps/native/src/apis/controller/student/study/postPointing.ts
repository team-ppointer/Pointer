import { client } from '@/apis/client';

const postPointing = async (pointingId: number, isUnderstood: boolean) => {
  return await client.POST('/api/student/study/submit/pointing', {
    body: {
      pointingId,
      isUnderstood,
    },
  });
};

export default postPointing;
