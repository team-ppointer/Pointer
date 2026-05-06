import { $api } from '@apis';

const putUser = () => {
  return $api.useMutation('put', '/api/admin/user/{id}');
};

export default putUser;
