import { $api } from '@apis';

const getPracticeTestTags = () => {
  return $api.useQuery('get', '/api/admin/practice-test', {});
};

export default getPracticeTestTags;
