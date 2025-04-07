import { $api } from '@apis';

const deleteProblemSet = () => {
  return $api.useMutation('delete', '/api/v1/problemSet/{problemSetId}');
};

export default deleteProblemSet;
