import { $api } from '@apis';

const postUser = () => {
  return $api.useMutation('post', '/api/admin/user');
};

export default postUser;
