import { TanstackQueryClient } from '@apis';

const useGetWeeklyProgress = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/study/progress/weekly');
};

export default useGetWeeklyProgress;
