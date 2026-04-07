import { $api } from '@apis';

const postTeacher = () => {
  return $api.useMutation('post', '/api/admin/teacher');
};

export default postTeacher;
