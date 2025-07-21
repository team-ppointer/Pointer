import { $api } from '@apis';

const putConfirmProblemSet = () => {
  return $api.useMutation('put', '/api/admin/problem-set/toggle-status/{id}');
};

export default putConfirmProblemSet;
