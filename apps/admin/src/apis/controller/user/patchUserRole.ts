import { $api } from '@apis';

const patchUserRole = () => {
  return $api.useMutation('patch', '/api/admin/user/{id}/role');
};

export default patchUserRole;
