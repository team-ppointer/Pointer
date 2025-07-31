import { $api } from '@apis';

const deleteProblemFromProblemSet = () => {
  return $api.useMutation('delete', '/api/admin/problem-set/{id}/{problemId}');
};

export default deleteProblemFromProblemSet;
