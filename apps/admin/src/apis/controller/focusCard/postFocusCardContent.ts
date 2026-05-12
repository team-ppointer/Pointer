import { $api } from '@apis';

const postFocusCardContent = () => {
  return $api.useMutation('post', '/api/admin/focus-card/{id}/content');
};

export default postFocusCardContent;
