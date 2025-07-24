import { client } from '@/apis/client';

const postChat = async (qnaId: number, content?: string, images?: number[]) => {
  const response = await client.POST(`/api/student/qna/chat`, {
    body: {
      qnaId,
      content: content ?? '',
      images: images ? [...images] : undefined,
    },
  });
  return response.data;
};

export default postChat;
