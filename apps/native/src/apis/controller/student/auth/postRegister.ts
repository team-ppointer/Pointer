import { client } from '@/apis/client';
import { type components } from '@schema';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];
const postRegister = async (data: StudentInitialRegisterReq) => {
  return await client.POST('/api/student/auth/register', {
    body: data,
  });
};

export default postRegister;
