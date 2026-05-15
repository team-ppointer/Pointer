import { $api } from '@apis';

const getEdgeType = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/edge-type');
};

export default getEdgeType;
