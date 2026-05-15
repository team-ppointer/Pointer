import { $api } from '@apis';

const putUserRole = () => {
  return $api.useMutation('put', '/api/admin/user/{id}/role');
};

export default putUserRole;
