import { $api } from '@apis';

const getEdge = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/edge');
};

export default getEdge;
