import { $api } from '@apis';

const deleteActionEdge = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/action-edge/{id}');
};

export default deleteActionEdge;
