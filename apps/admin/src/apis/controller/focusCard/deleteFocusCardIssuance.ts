import { $api } from '@apis';

const deleteFocusCardIssuance = () => {
  return $api.useMutation('delete', '/api/admin/focus-card/issuance/{id}');
};

export default deleteFocusCardIssuance;
