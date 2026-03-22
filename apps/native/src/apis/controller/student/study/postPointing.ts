import { client } from '@/apis/client';

type PointingFeedbackBody = {
  pointingId: number;
  publishId?: number;
  isQuestionUnderstood?: boolean;
  isCommentUnderstood?: boolean;
};

const postPointing = async ({
  pointingId,
  publishId,
  isQuestionUnderstood,
  isCommentUnderstood,
}: PointingFeedbackBody) => {
  return await client.POST('/api/student/study/submit/pointing', {
    body: {
      pointingId,
      ...(publishId != null && { publishId }),
      ...(isQuestionUnderstood != null && { isQuestionUnderstood }),
      ...(isCommentUnderstood != null && { isCommentUnderstood }),
    },
  });
};

export default postPointing;
