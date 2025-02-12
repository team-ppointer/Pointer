import { get } from '@apis';

const getPracticeTestTags = () => {
  return get('/api/v1/practiceTestTags', {});
};

export default getPracticeTestTags;
