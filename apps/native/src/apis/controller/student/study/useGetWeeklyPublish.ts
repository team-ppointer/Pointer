import { TanstackQueryClient } from '@apis';

const useGetWeeklyPublish = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/study/publish/weekly');
};

export default useGetWeeklyPublish;
