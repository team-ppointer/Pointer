import { $api } from '@apis';

const upsertDailyComment = () => {
  return $api.useMutation('post', '/api/admin/daily-comments');
};

export default upsertDailyComment;
