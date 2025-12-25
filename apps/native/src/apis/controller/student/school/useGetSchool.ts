import { TanstackQueryClient } from '@apis';

type Props = {
  query: string;
  enabled?: boolean;
};

const useGetSchool = ({ query, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery('get', '/api/student/school', {
    query: {
      query,
    },
    enabled: enabled && query.trim().length > 0,
  });
};

export default useGetSchool;
