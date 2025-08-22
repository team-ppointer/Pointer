import { $api } from '@apis';

const deleteDiagnosis = () => {
  return $api.useMutation('delete', '/api/admin/diagnosis/{id}');
};

export default deleteDiagnosis;
