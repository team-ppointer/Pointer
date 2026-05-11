import { $api } from '@apis';
import { GetDailyCommentParams } from '@types';

const getDailyComment = (params: GetDailyCommentParams, enabled: boolean = true) => {
  return $api.useQuery(
    'get',
    '/api/admin/daily-comments',
    {
      params: {
        query: params,
      },
    },
    { enabled }
  );
};

export default getDailyComment;
