import { $api } from '@apis';

const postPublish = () => {
  return $api.useMutation('post', '/api/admin/publish');
};

export default postPublish;
