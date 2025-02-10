import { post } from '../../client';

const postLogin = () => {
  return post('/api/v1/auth/admin/login');
};

export default postLogin;
