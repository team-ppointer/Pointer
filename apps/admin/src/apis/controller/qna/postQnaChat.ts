import { $api } from '@apis';

const postQnaChat = () => {
  return $api.useMutation('post', '/api/admin/qna/chat');
};

export default postQnaChat;
