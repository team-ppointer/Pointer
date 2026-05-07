import { $api } from '@apis';

const putMenu = () => {
  return $api.useMutation('put', '/api/admin/menu/{id}');
};

export default putMenu;
