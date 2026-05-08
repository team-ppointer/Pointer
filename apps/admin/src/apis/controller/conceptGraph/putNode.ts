import { $api } from '@apis';

const putNode = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/node/{id}');
};

export default putNode;
