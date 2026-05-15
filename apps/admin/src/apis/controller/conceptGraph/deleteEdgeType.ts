import { $api } from '@apis';

const deleteEdgeType = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/edge-type/{id}');
};

export default deleteEdgeType;
