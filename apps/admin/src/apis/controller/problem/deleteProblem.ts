import { $api } from '@apis';

const deleteProblem = () => {
  return $api.useMutation('delete', '/api/admin/problem/{id}');
};

export default deleteProblem;
