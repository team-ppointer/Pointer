import { $api } from '@apis';

const putRole = () => {
  return $api.useMutation('put', '/api/admin/role/{id}');
};

export default putRole;
