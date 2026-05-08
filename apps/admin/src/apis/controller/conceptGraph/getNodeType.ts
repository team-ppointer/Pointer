import { $api } from '@apis';

const getNodeType = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/node-type');
};

export default getNodeType;
