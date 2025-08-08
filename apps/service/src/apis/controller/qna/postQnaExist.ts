import { client } from '@/apis/client';
import { components } from '@schema';

const postQnaExist = (props: components['schemas']['QnACheckRequest']) => {
  return client.POST('/api/student/qna/exist', {
    body: { ...props },
  });
};

export default postQnaExist;
