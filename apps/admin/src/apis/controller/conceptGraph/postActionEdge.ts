import { $api } from '@apis';

const postActionEdge = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/action-edge');
};

export default postActionEdge;
