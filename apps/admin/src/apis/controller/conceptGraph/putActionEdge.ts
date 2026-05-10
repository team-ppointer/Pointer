import { $api } from '@apis';

const putActionEdge = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/action-edge/{id}');
};

export default putActionEdge;
