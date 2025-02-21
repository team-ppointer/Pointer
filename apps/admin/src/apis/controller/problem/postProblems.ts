import { $api } from 'src/apis/client';

const postProblems = () => {
  return $api.useMutation('post', '/api/v1/problems');
};

export default postProblems;
