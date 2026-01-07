import { $api } from '@apis';

const postPracticeTest = () => {
  return $api.useMutation('post', '/api/admin/practice-test');
};

export default postPracticeTest;
