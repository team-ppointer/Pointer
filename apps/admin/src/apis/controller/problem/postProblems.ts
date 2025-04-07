import { $api } from '@apis';

const postProblems = () => {
  return $api.useMutation('post', '/api/v1/problems');
};

export default postProblems;
