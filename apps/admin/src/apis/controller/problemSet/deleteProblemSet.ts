import { $api } from '@apis';

const deleteProblemSet = () => {
  return $api.useMutation('delete', '/api/admin/problem-set/{id}');
};

export default deleteProblemSet;
