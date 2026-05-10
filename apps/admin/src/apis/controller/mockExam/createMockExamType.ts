import { $api } from '@apis';

const createMockExamType = () => {
  return $api.useMutation('post', '/api/admin/mock-exam/types');
};

export default createMockExamType;
