import { $api } from 'src/apis/client';

const postPublish = () => {
  return $api.useMutation('post', '/api/v1/publish');
};

export default postPublish;
