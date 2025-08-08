import { client } from '@apis';

const postPointingSubmit = async (pointingId: number, isUnderstood: boolean) => {
  return await client.POST('/api/student/study/submit/pointing', {
    body: {
      pointingId,
      isUnderstood,
    },
  });
};

export default postPointingSubmit;
