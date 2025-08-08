import { $api } from '@apis';

const putProblemSetStatus = () => {
  return $api.useMutation('put', '/api/admin/problem-set/{id}/status');
};

export default putProblemSetStatus;
