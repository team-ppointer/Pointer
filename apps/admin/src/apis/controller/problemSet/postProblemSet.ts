import { $api } from '@apis';

const postProblemSet = () => {
  return $api.useMutation('post', '/api/v1/problemSet');
};

export default postProblemSet;
