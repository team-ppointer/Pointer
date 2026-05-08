import { $api } from '@apis';

const deleteNode = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/node/{id}');
};

export default deleteNode;
