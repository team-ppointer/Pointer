import { $api } from '@apis';

interface GetQnaParams {
  query?: string;
}

const getQna = (params?: GetQnaParams) => {
  return $api.useQuery('get', '/api/admin/qna', {
    params: {
      query: params,
    },
  });
};

export default getQna;

