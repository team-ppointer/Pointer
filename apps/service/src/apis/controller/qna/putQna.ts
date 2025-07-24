import { client } from '@/apis/client';

const putQna = async (qnaId: number, question: string) => {
  const response = await client.PUT(`/api/student/qna/{qnaId}`, {
    params: {
      path: {
        qnaId: qnaId,
      },
    },
    body: {
      question,
      images: [],
    },
  });
  return response.data;
};

export default putQna;
