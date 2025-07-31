import { $api } from '@apis';
import { GetNoticeParams } from '@types';

const getNotice = (params: GetNoticeParams) => {
  return $api.useQuery('get', '/api/admin/notice', {
    params: {
      query: params,
    },
  });
};

export default getNotice;
