import { $api } from '@apis';

const putActionEdgeType = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/action-edge-type/{id}');
};

export default putActionEdgeType;
