import { $api } from '@apis';

const postFocusCard = () => {
  return $api.useMutation('post', '/api/admin/focus-card');
};

export default postFocusCard;
