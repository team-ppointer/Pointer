import { $api } from '@apis';

interface GetQnaByIdParams {
  qnaId: number;
  enabled?: boolean;
}

const getQnaById = ({ qnaId, enabled = true }: GetQnaByIdParams) => {
  return $api.useQuery(
    'get',
    '/api/admin/qna/{qnaId}',
    {
      params: {
        path: { qnaId },
      },
    },
    { enabled }
  );
};

export default getQnaById;

