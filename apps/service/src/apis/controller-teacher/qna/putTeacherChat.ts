import { client } from '@/apis/client';

const putTeacherChat = async (chatId: number, content: string) => {
  const response = await client.PUT(`/api/teacher/qna/chat/{chatId}`, {
    params: {
      path: {
        chatId: chatId,
      },
    },
    body: {
      content,
    },
  });
  return response.data;
};

export default putTeacherChat;
