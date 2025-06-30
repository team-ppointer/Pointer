import { client } from '@apis';

const postProblemSubmit = async (publishId: number, problemId: number) => {
  return await client.POST('/api/v1/client/problemSubmit', {
    body: {
      publishId,
      problemId,
    },
  });
};

export default postProblemSubmit;
