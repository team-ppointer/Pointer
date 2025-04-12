import { $api } from '@apis';

const putConfirmProblemSet = () => {
  return $api.useMutation('put', '/api/v1/problemSet/{problemSetId}/confirm');
};

export default putConfirmProblemSet;
