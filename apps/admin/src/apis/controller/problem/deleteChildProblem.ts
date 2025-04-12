import { $api } from '@apis';

const deleteChildProblem = () => {
  return $api.useMutation('delete', '/api/v1/problems/{problemId}/child-problems/{childProblemId}');
};

export default deleteChildProblem;
