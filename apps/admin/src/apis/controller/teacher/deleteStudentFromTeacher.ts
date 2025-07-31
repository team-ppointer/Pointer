import { $api } from '@apis';

const deleteStudentFromTeacher = () => {
  return $api.useMutation('delete', '/api/admin/teacher/{teacherId}/{studentId}');
};

export default deleteStudentFromTeacher;
