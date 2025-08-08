import { $api } from '@apis';

const putConceptCategory = () => {
  return $api.useMutation('put', '/api/admin/concept/category/{categoryId}');
};

export default putConceptCategory;
