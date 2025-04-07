import { $api } from '@apis';

const postChildProblem = () => {
  return $api.useMutation('post', '/api/v1/problems/{problemId}/child-problems');
};

export default postChildProblem;
