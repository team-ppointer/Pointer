import { $api } from 'src/apis/client';

const deleteChildProblem = () => {
  return $api.useMutation('delete', '/api/v1/problems/{problemId}/child-problems/{childProblemId}');
};

export default deleteChildProblem;
