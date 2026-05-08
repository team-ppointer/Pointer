import { $api } from '@apis';

const postActionEdgeType = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/action-edge-type');
};

export default postActionEdgeType;
