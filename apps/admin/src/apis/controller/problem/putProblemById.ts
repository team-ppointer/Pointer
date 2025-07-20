import { $api } from '@apis';

const putProblemById = () => {
  return $api.useMutation('put', '/api/admin/problem/{id}');
};

export default putProblemById;
