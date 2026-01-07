import { $api } from '@apis';
import { GetNotificationParams } from '@types';

const getNotification = (params: GetNotificationParams) => {
  return $api.useQuery('get', '/api/admin/notification', {
    params: {
      query: params,
    },
  });
};

export default getNotification;
