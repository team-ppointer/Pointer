import { $api } from 'src/apis/client';

const getPublish = (year: number, month: number) => {
  return $api.useQuery(
    'get',
    '/api/v1/publish/{year}/{month}',
    {
      params: {
        path: {
          year,
          month,
        },
      },
    },
    {
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 24,
    }
  );
};

export default getPublish;
