import { $api } from '@apis';

const deleteMockExamType = () => {
  return $api.useMutation('delete', '/api/admin/mock-exam/types/{id}');
};

export default deleteMockExamType;
