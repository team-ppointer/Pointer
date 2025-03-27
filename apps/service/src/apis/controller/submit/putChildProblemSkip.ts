import { client } from '@apis';

const putChildProblemSkip = async (publishId: string, childProblemId: string) => {
  return await client.PUT('/api/v1/client/childProblemSubmit/incorrect', {
    body: {
      publishId: Number(publishId),
      childProblemId: Number(childProblemId),
    },
  });
};

export default putChildProblemSkip;
