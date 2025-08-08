import { $api } from '@apis';
import { GetStudentParams } from '@types';

const getStudent = (params: GetStudentParams) => {
  return $api.useQuery('get', '/api/admin/student', {
    params: {
      query: params,
    },
  });
};

export default getStudent;
