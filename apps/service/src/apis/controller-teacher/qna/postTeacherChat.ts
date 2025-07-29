import { client } from '@/apis/client';

const postTeacherChat = async (qnaId: number, content?: string, images?: number[]) => {
  const response = await client.POST(`/api/teacher/qna/chat`, {
    body: {
      qnaId,
      content: content ?? '',
      images: images ? [...images] : undefined,
    },
  });
  return response.data;
};

export default postTeacherChat;
