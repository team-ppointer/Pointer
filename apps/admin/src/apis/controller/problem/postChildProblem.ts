import { $api } from 'src/apis/client';

const postChildProblem = () => {
  return $api.useMutation('post', '/api/v1/problems/{problemId}/child-problems');
};

export default postChildProblem;
