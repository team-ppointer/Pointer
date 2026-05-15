import { $api } from '@apis';

const postFocusCardIssuance = () => {
  return $api.useMutation('post', '/api/admin/focus-card/issuance');
};

export default postFocusCardIssuance;
