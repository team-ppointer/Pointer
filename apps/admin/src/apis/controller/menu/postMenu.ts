import { $api } from '@apis';

const postMenu = () => {
  return $api.useMutation('post', '/api/admin/menu');
};

export default postMenu;
