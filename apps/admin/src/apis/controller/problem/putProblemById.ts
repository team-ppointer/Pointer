import { $api } from '@apis';

const putProblemById = () => {
  return $api.useMutation('put', '/api/v1/problems/{id}');
};

export default putProblemById;
