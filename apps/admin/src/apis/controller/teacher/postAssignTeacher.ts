import { $api } from '@apis';

const postAssignTeacher = () => {
  return $api.useMutation('post', '/api/admin/teacher/assign/{teacherId}');
};

export default postAssignTeacher;
