import { $api } from '@apis';

const deleteMenu = () => {
  return $api.useMutation('delete', '/api/admin/menu/{id}');
};

export default deleteMenu;
