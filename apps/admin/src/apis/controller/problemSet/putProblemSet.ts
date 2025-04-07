import { $api } from '@apis';

const putProblemSet = () => {
  return $api.useMutation('put', '/api/v1/problemSet/{problemSetId}');
};

export default putProblemSet;
