import { TanstackQueryClient } from '@/apis/client';

const useGetWeeklyPublish = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/study/publish/weekly');
};

export default useGetWeeklyPublish;
