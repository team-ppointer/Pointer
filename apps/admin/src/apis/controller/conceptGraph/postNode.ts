import { $api } from '@apis';

const postNode = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/node');
};

export default postNode;
