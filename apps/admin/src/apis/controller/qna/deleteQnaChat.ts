import { $api } from '@apis';

const deleteQnaChat = () => {
  return $api.useMutation('delete', '/api/admin/qna/chat/{chatId}');
};

export default deleteQnaChat;

