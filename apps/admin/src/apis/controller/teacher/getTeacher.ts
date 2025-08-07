import { $api } from '@apis';
import { GetTeacherParams } from '@types';

const getTeacher = (params: GetTeacherParams) => {
  return $api.useQuery('get', '/api/admin/teacher', {
    params: {
      query: params,
    },
  });
};

export default getTeacher;
