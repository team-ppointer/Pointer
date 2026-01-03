import { TanstackQueryClient } from '@apis';

const useGetSubscribeQna = (qnaId: number, token: string) => {
  return TanstackQueryClient.useQuery('get', '/api/qna/{qnaId}/subscribe', {
    params: {
      path: {
        qnaId: qnaId,
      },
      query: {
        token: token,
      },
    },
  });
};
