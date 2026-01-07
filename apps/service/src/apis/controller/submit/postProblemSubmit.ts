import { client } from '@apis';

const postProblemSubmit = async (
  publishId: number,
  problemId: number | null,
  submitAnswer: number | null
) => {
  const body: {
    publishId: number;
    problemId?: number;
    submitAnswer?: number;
  } = {
    publishId,
    ...(submitAnswer !== null && submitAnswer !== undefined ? { submitAnswer } : {}),
  };

  if (problemId !== null) {
    body.problemId = problemId;
  } else {
    throw new Error('problemId 반드시 입력하세요.');
  }

  return await client.POST('/api/student/study/submit/answer', {
    body,
  });
};

export default postProblemSubmit;
