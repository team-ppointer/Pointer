import { $api } from '@apis';

const putTeacherStudent = () => {
  return $api.useMutation('put', '/api/admin/teacher/student/{teacherId}');
};

export default putTeacherStudent;
