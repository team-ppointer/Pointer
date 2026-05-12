import { $api } from '@apis';

const getFocusCardList = () => {
  return $api.useQuery('get', '/api/admin/focus-card');
};

export default getFocusCardList;
