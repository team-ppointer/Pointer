import { $api } from '@apis';

const postConceptCategory = () => {
  return $api.useMutation('post', '/api/admin/concept/category');
};

export default postConceptCategory;
