import { $api } from '@apis';

const getMockExamTypes = () => {
  return $api.useQuery('get', '/api/admin/mock-exam/types');
};

export default getMockExamTypes;
