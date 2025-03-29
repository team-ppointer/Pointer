import { $api } from 'src/apis/client';

const getPracticeTestTags = () => {
  return $api.useQuery('get', '/api/v1/practiceTestTags', {});
};

export default getPracticeTestTags;
