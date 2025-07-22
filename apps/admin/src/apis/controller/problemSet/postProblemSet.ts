import { $api } from '@apis';

const postProblemSet = () => {
  return $api.useMutation('post', '/api/admin/problem-set');
};

export default postProblemSet;
