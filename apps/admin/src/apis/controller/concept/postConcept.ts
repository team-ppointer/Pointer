import { $api } from '@apis';

const postConcept = () => {
  return $api.useMutation('post', '/api/admin/concept');
};

export default postConcept;
