import { $api } from '@apis';

const putNodeType = () => {
  return $api.useMutation('put', '/api/admin/concept/graph/node-type/{id}');
};

export default putNodeType;
