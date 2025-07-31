import { $api } from '@apis';

const deleteConceptCategory = () => {
  return $api.useMutation('delete', '/api/admin/concept/category/{categoryId}');
};

export default deleteConceptCategory;
