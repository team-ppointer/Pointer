import { $api } from '@apis';

const getPublish = (year: number, month: number, studentId: number) => {
  return $api.useQuery('get', '/api/admin/publish', {
    params: {
      query: {
        year,
        month,
        studentId,
      },
    },
  });
};

export default getPublish;
