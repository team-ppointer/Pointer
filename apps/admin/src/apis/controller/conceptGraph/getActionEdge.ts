import { $api } from '@apis';

const getActionEdge = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/action-edge');
};

export default getActionEdge;
