import { client } from '@/apis/client';
import { type components } from '@schema';

type StudentSignupReq = components['schemas']['StudentSignupReq'];
const postSignUpLocal = async (data: StudentSignupReq) => {
  return await client.POST('/api/student/auth/signup/local', {
    body: data,
  });
};

export default postSignUpLocal;
