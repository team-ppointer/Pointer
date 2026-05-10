import { $api } from '@apis';

const getActionEdgeType = () => {
  return $api.useQuery('get', '/api/admin/concept/graph/action-edge-type');
};

export default getActionEdgeType;
