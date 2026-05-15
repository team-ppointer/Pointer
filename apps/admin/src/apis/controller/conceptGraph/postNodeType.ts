import { $api } from '@apis';

const postNodeType = () => {
  return $api.useMutation('post', '/api/admin/concept/graph/node-type');
};

export default postNodeType;
