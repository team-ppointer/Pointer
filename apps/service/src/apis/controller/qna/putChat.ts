import { client } from '@/apis/client';

const putChat = async (chatId: number, content: string) => {
  const response = await client.PUT(`/api/student/qna/chat/{chatId}`, {
    params: {
      path: {
        chatId: chatId,
      },
    },
    body: {
      content,
      images: [],
    },
  });
  return response.data;
};

export default putChat;
