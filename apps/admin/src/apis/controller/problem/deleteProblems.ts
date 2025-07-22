import { $api } from '@apis';

const deleteProblems = () => {
  return $api.useMutation('delete', '/api/admin/problem/{id}');
};

export default deleteProblems;
