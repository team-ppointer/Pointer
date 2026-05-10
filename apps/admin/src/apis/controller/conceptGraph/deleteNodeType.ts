import { $api } from '@apis';

const deleteNodeType = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/node-type/{id}');
};

export default deleteNodeType;
