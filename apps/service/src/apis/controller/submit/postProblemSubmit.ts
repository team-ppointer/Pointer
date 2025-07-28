import { client } from '@apis';

const postProblemSubmit = async (
  publishId: number,
  problemId: number | null,
  childProblemId: number | null,
  submitAnswer: number | null
) => {
  const body: {
    publishId: number;
    problemId?: number;
    childProblemId?: number;
    submitAnswer?: number | null;
  } = {
    publishId,
    submitAnswer,
  };

  if (problemId !== null && childProblemId === null) {
    body.problemId = problemId;
  } else if (childProblemId !== null && problemId === null) {
    body.childProblemId = childProblemId;
  } else {
    throw new Error('problemId와 childProblemId 중 하나는 반드시 입력하세요.');
  }

  return await client.POST('/api/student/study/submit/answer', {
    body,
  });
};

export default postProblemSubmit;
