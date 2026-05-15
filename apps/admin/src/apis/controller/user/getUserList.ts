import { $api } from '@apis';

const getUserList = () => {
  return $api.useQuery('get', '/api/admin/user');
};

export default getUserList;
