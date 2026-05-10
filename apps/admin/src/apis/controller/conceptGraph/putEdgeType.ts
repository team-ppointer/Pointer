import { $api } from '@apis';

const putEdgeType = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/edge-type/{id}');
};

export default putEdgeType;
