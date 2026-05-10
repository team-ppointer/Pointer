import { $api } from '@apis';

const deleteUser = () => {
  return $api.useMutation('delete', '/api/admin/user/{id}');
};

export default deleteUser;
