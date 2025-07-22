import { $api } from '@apis';

const getConceptTags = () => {
  return $api.useQuery('get', '/api/admin/concept');
};

export default getConceptTags;
