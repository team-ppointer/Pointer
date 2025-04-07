import { $api } from '@apis';

const postPublish = () => {
  return $api.useMutation('post', '/api/v1/publish');
};

export default postPublish;
