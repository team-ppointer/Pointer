import { $api } from 'src/apis/client';

const getConceptTags = () => {
  return $api.useQuery('get', '/api/v1/conceptTags');
};

export default getConceptTags;
