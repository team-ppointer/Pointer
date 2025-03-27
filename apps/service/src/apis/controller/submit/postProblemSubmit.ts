import { client } from '@apis';

const postProblemSubmit = async (publishId: string, problemId: string) => {
  return await client.POST('/api/v1/client/problemSubmit', {
    body: {
      publishId: Number(publishId),
      problemId: Number(problemId),
    },
  });
};

export default postProblemSubmit;
