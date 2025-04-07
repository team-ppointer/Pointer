import { $api } from '@apis';

const deleteProblems = () => {
  return $api.useMutation('delete', '/api/v1/problems/{id}');
};

export default deleteProblems;
