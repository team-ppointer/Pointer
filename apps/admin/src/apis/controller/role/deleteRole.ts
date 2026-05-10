import { $api } from '@apis';

const deleteRole = () => {
  return $api.useMutation('delete', '/api/admin/role/{id}');
};

export default deleteRole;
