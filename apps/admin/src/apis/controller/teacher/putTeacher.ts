import { $api } from '@apis';

const putTeacher = () => {
  return $api.useMutation('put', '/api/admin/teacher/{id}');
};

export default putTeacher;
