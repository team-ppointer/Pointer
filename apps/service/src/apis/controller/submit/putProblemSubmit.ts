import { client } from '@apis';

const putProblemSubmit = async (publishId: string, problemId: string, answer: string) => {
  return await client.PUT('/api/v1/client/problemSubmit', {
    body: {
      publishId: Number(publishId),
      problemId: Number(problemId),
      answer,
    },
  });
};

export default putProblemSubmit;
