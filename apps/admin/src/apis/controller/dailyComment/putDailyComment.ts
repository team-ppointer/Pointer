import { $api } from '@apis';

const putDailyComment = () => {
  return $api.useMutation('put', '/api/admin/daily-comments/{id}');
};

export default putDailyComment;
