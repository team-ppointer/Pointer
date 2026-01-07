import { TanstackQueryClient } from '@/apis/client';

const useGetWeeklyProgress = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/study/progress/weekly');
};

export default useGetWeeklyProgress;
