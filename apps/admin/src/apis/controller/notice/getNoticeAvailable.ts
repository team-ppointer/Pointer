import { $api } from '@apis';
import { GetNoticeAvailableParams } from '@types';

const getNoticeAvailable = (params: GetNoticeAvailableParams) => {
  return $api.useQuery('get', '/api/admin/notice/available', {
    params: {
      query: params,
    },
  });
};

export default getNoticeAvailable;
