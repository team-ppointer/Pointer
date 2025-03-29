import { $api } from 'src/apis/client';

const getPublish = (year: number, month: number) => {
  return $api.useQuery('get', '/api/v1/publish/{year}/{month}', {
    params: {
      path: {
        year,
        month,
      },
    },
  });
};

export default getPublish;
