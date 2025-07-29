import { TanstackQueryClient } from '@apis';

const useGetStudent = () => {
  return TanstackQueryClient.useQuery('get', '/api/teacher/students');
};

export default useGetStudent;
import { IcCalendar, IcThumbtack } from '@svg';
