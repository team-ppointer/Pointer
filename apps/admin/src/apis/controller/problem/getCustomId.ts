import { $api } from '@apis';

const getCustomId = () => {
  return $api.useQuery('get', '/api/admin/problem/custom-id/generate');
};

export default getCustomId;
