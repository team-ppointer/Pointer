import { $api } from '@apis';

const putConcept = () => {
  return $api.useMutation('put', '/api/admin/concept/{conceptId}');
};

export default putConcept;
