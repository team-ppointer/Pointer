import { post } from '@apis';

const postLogin = () => {
  return post('/api/v1/auth/admin/login');
};

export default postLogin;
