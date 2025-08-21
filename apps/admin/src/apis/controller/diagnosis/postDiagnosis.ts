import { $api } from '@apis';

const postDiagnosis = () => {
  return $api.useMutation('post', '/api/admin/diagnosis');
};

export default postDiagnosis;
