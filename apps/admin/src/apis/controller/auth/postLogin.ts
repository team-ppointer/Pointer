import { $api } from '@apis';

const postLogin = () => {
  return $api.useMutation('post', '/api/admin/auth/login/local');
};

export default postLogin;
