import { $api } from '@apis';
import { GetStudentParams } from '@types';

const getStudent = (params: GetStudentParams, options?: { enabled?: boolean }) => {
  return $api.useQuery(
    'get',
    '/api/admin/student',
    {
      params: {
        query: params,
      },
    },
    options
  );
};

export default getStudent;
