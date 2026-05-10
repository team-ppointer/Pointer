import { $api } from '@apis';

const getMenus = () => {
  return $api.useQuery('get', '/api/admin/menu');
};

export default getMenus;
