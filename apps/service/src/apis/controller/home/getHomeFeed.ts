import { client } from '@/apis/client';

const getHomeFeed = async () => {
  const { data } = await client.GET('/api/v1/client/home-feed');
  return data?.data;
};

export default getHomeFeed;
