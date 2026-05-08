import { $api } from '@apis';

const postEdge = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/edge');
};

export default postEdge;
