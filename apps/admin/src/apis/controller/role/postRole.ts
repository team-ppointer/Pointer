import { $api } from '@apis';

const postRole = () => {
  return $api.useMutation('post', '/api/admin/role');
};

export default postRole;
