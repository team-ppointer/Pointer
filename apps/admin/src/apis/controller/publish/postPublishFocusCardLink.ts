import { $api } from '@apis';

const postPublishFocusCardLink = () => {
  return $api.useMutation('post', '/api/admin/publishes/{publishId}/focus-card-links');
};

export default postPublishFocusCardLink;
