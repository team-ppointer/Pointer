import { $api } from '@apis';

const putDiagnosis = () => {
  return $api.useMutation('put', '/api/admin/diagnosis/{id}');
};

export default putDiagnosis;
