import { $api } from '@apis';

const deleteDailyComment = () => {
  return $api.useMutation('delete', '/api/admin/daily-comments/{id}');
};

export default deleteDailyComment;
