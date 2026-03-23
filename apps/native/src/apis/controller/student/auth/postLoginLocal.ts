import { type components } from '@schema';
import { client } from '@/apis/client';

type StudentLoginReq = components['schemas']['StudentLoginReq'];
const postLoginLocal = async (data: StudentLoginReq) => {
  return await client.POST('/api/student/auth/login/local', {
    body: data,
  });
};

export default postLoginLocal;
