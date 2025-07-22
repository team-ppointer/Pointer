import { $api } from '@apis';

const postProblems = () => {
  return $api.useMutation('post', '/api/admin/problem');
};

export default postProblems;
