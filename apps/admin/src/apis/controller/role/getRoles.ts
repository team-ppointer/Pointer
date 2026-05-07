import { $api } from '@apis';

const getRoles = () => {
  return $api.useQuery('get', '/api/admin/role');
};

export default getRoles;
