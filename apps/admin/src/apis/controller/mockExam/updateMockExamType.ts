import { $api } from '@apis';

const updateMockExamType = () => {
  return $api.useMutation('put', '/api/admin/mock-exam/types/{id}');
};

export default updateMockExamType;
