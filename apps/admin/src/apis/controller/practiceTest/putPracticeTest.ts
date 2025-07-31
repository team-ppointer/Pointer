import { $api } from '@apis';

const putPracticeTest = () => {
  return $api.useMutation('put', '/api/admin/practice-test/{id}');
};

export default putPracticeTest;