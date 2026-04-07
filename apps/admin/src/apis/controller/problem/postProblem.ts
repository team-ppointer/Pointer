import { $api } from '@apis';

const postProblem = () => {
  return $api.useMutation('post', '/api/admin/problem');
};

export default postProblem;
