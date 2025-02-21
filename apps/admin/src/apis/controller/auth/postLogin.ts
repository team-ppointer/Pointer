import { $api } from 'src/apis/client';

const postLogin = () => {
  return $api.useMutation('post', '/api/v1/auth/admin/login');
};

export default postLogin;
