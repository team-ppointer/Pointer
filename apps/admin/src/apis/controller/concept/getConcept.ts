import { $api } from '@apis';
import { GetConceptParams } from '@types';

const getConcept = (params: GetConceptParams = {}) => {
  return $api.useQuery('get', '/api/admin/concept', {
    params: {
      query: params,
    },
  });
};

export default getConcept;
