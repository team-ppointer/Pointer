import { $api } from '@apis';
import { GetPracticeTestParams } from '@types';

const getPracticeTest = (params: GetPracticeTestParams = {}) => {
  return $api.useQuery('get', '/api/admin/practice-test', {
    params: {
      query: params,
    },
  });
};

export default getPracticeTest;
