import { TanstackQueryClient } from '@apis';

const getHomeFeed = () => {
  return TanstackQueryClient.useQuery('get', '/api/v1/client/home-feed');
};

export default getHomeFeed;
