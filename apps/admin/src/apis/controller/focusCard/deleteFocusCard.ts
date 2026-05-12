import { $api } from '@apis';

const deleteFocusCard = () => {
  return $api.useMutation('delete', '/api/admin/focus-card/{id}');
};

export default deleteFocusCard;
