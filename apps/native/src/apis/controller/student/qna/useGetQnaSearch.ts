import { TanstackQueryClient } from '@/apis/client';

type Props = {
  query?: string;
  enabled?: boolean;
};

const useGetQnaSearch = ({ query, enabled = true }: Props = {}) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/search',
    {
      params: {
        query: { query },
      },
    },
    { enabled: enabled && (query?.trim().length ?? 0) > 0 }
  );
};

export default useGetQnaSearch;
