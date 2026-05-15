import { $api } from '@apis';

const deleteActionEdgeType = () => {
  return $api.useMutation('delete', '/api/admin/concept/graph/action-edge-type/{id}');
};

export default deleteActionEdgeType;
