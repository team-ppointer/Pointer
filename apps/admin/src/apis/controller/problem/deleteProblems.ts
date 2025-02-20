import { $api } from 'src/apis/client';

const deleteProblems = () => {
  return $api.useMutation('delete', '/api/v1/problems/{id}');
};

export default deleteProblems;
