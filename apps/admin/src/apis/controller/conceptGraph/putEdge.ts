import { $api } from '@apis';

const putEdge = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/edge/{id}');
};

export default putEdge;
