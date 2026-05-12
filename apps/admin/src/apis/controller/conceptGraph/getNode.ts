import { $api } from '@apis';

interface GetNodeParams {
  onlyFocusCardCandidates?: boolean;
}

const getNode = (params: GetNodeParams = {}) => {
  return $api.useQuery('get', '/api/admin/concept/graph/node', {
    params: {
      query: params,
    },
  });
};

export default getNode;
