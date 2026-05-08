import { $api } from '@apis';

const getNode = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/node');
};

export default getNode;
