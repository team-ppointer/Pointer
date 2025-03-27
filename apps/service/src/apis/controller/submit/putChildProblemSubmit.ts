import { client } from '@/apis/client';

const putChildProblemSubmit = async (publishId: string, childProblemId: string, answer: string) => {
  return await client.PUT('/api/v1/client/childProblemSubmit', {
    body: {
      publishId: Number(publishId),
      childProblemId: Number(childProblemId),
      answer,
    },
  });
};

export default putChildProblemSubmit;
