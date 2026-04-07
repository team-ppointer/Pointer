import { $api } from '@apis';

const deletePracticeTest = () => {
  return $api.useMutation('delete', '/api/admin/practice-test/{id}');
};

export default deletePracticeTest;
