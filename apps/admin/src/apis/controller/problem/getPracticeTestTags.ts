import { $api } from '@apis';

const getPracticeTestTags = () => {
  return $api.useQuery('get', '/api/v1/practiceTestTags', {});
};

export default getPracticeTestTags;
