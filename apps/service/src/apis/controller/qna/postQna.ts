import { client } from '@/apis/client';
import { components } from '@schema';

const postQna = async (data: {
  publishId: number;
  problemId?: number;
  childProblemId?: number;
  pointingId?: number;
  images?: number[];
  type: components['schemas']['QnAResp']['type'];
  content: string;
}) => {
  const response = await client.POST('/api/student/qna', {
    body: {
      publishId: data.publishId,
      problemId: data.problemId ?? undefined,
      childProblemId: data.childProblemId ?? undefined,
      pointingId: data.pointingId ?? undefined,
      type: data.type,
      question: data.content,
      images: data.images ?? [],
    },
  });

  return response;
};

export default postQna;
