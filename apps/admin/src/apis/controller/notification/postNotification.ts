import { $api } from '@apis';

const postNotification = () => {
  return $api.useMutation('post', '/api/admin/notification/send');
};

export default postNotification;
