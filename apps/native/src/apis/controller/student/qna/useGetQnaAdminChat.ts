import { TanstackQueryClient } from '@/apis/client';

type Props = {
  enabled?: boolean;
};

const useGetQnaAdminChat = ({ enabled = true }: Props = {}) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/qna/admin-chat',
    {},
    { enabled }
  );
};

export default useGetQnaAdminChat;
