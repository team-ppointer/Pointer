import { $api } from '@apis';

const deleteEdge = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/edge/{id}');
};

export default deleteEdge;
