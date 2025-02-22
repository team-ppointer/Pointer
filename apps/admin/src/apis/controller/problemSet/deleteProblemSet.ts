import { $api } from 'src/apis/client';

const deleteProblemSet = () => {
  return $api.useMutation('delete', '/api/v1/problemSet/{problemSetId}');
};

export default deleteProblemSet;
