import { client } from '@/apis/client';
import { components } from '@schema';

type StudentLoginReq = components['schemas']['StudentLoginReq'];
const postLoginLocal = async (data: StudentLoginReq) => {
  return await client.POST('/api/student/auth/login/local', {
    body: data,
  });
};

export default postLoginLocal;
