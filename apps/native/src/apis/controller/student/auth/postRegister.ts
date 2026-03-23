import { type components } from '@schema';
import { client } from '@/apis/client';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];
const postRegister = async (data: StudentInitialRegisterReq) => {
  return await client.POST('/api/student/auth/register', {
    body: data,
  });
};

export default postRegister;
