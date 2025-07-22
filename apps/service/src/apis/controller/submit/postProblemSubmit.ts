import { client } from '@apis';

const postProblemSubmit = async (
  publishId: number,
  problemId: number,
  childProblemId: number,
  submitAnswer: number
) => {
  return await client.POST('/api/student/study/submit/answer', {
    body: {
      publishId,
      problemId,
      childProblemId,
      submitAnswer,
    },
  });
};

export default postProblemSubmit;
