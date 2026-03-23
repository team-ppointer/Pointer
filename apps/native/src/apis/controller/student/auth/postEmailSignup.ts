import { type components } from '@schema';

import { client } from '@/apis/client';

type StudentSignupReq = components['schemas']['StudentSignupReq'];
const postEmailSignup = async (data: StudentSignupReq) => {
  try {
    const response = await client.POST('/api/student/auth/signup/local', {
      body: data,
    });
    return { isSuccess: true, data: response.data };
  } catch (error) {
    return { isSuccess: false, error: error };
  }
};

export default postEmailSignup;
