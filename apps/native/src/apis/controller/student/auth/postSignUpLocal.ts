import { type components } from '@schema';

import { client } from '@/apis/client';

type StudentSignupReq = components['schemas']['StudentSignupReq'];
const postSignUpLocal = async (data: StudentSignupReq) => {
  return await client.POST('/api/student/auth/signup/local', {
    body: data,
  });
};

export default postSignUpLocal;
