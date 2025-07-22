import { client } from '@/apis/client';
import { components } from '@schema';

const postQna = async (data: components['schemas']['QnACreateRequest']) => {
  const response = await client.POST('/api/student/qna', {
    body: { ...data },
  });

  return response;
};

export default postQna;
