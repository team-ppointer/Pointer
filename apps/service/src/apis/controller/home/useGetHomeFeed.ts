import { TanstackQueryClient } from '@apis';

const useGetHomeFeed = () => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/home-feed',
    {},
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetHomeFeed;
