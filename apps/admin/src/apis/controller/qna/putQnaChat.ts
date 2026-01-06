import { $api } from '@apis';

const putQnaChat = () => {
  return $api.useMutation('put', '/api/admin/qna/chat/{chatId}');
};

export default putQnaChat;

