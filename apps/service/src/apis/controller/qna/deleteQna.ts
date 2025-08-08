import { client } from '@/apis/client';

const deleteQna = async (qnaId: number) => {
  return client.DELETE('/api/student/qna/{qnaId}', {
    params: { path: { qnaId: qnaId } },
  });
};
export default deleteQna;
