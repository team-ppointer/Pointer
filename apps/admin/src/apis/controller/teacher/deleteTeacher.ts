import { $api } from '@apis';

const deleteTeacher = () => {
  return $api.useMutation('delete', '/api/admin/teacher/{teacherId}');
};

export default deleteTeacher;
