import { $api } from 'src/apis/client';

const postProblemSet = () => {
  return $api.useMutation('post', '/api/v1/problemSet');
};

export default postProblemSet;
