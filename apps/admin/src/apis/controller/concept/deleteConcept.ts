import { $api } from '@apis';

const deleteConcept = () => {
  return $api.useMutation('delete', '/api/admin/concept/{conceptId}');
};

export default deleteConcept;
