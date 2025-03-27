import { client } from '@apis';

const postChildProblemSubmit = async (publishId: string, problemId: string) => {
  return await client.POST('/api/v1/client/childProblemSubmit', {
    body: {
      publishId: Number(publishId),
      problemId: Number(problemId),
    },
  });
};

export default postChildProblemSubmit;
