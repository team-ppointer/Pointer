import { $api } from '@apis';

const postEdgeType = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/edge-type');
};

export default postEdgeType;
