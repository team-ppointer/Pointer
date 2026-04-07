import { $api } from '@apis';

const putProblemSetToggleStatus = () => {
  return $api.useMutation('put', '/api/admin/problem-set/toggle-status/{id}');
};

export default putProblemSetToggleStatus;
