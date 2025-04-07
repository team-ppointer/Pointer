import { $api } from '@apis';

const getConceptTags = () => {
  return $api.useQuery('get', '/api/v1/conceptTags');
};

export default getConceptTags;
