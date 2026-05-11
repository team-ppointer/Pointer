import { $api } from '@apis';
import { GetMockExamByStudentParams } from '@types';

const getMockExamByStudent = (params: GetMockExamByStudentParams, enabled: boolean = true) => {
  return $api.useQuery(
    'get',
    '/api/admin/mock-exam',
    {
      params: {
        query: params,
      },
    },
    { enabled }
  );
};

export default getMockExamByStudent;
