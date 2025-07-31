import { $api } from '@apis';

const getTeacher = () => {
  return $api.useQuery('get', '/api/admin/teacher', {});
};

export default getTeacher;
