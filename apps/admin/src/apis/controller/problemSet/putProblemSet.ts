import { $api } from '@apis';

const putProblemSet = () => {
  return $api.useMutation('put', '/api/admin/problem-set/{id}');
};

export default putProblemSet;
