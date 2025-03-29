import { $api } from '@apis';
import { useQueryClient } from '@tanstack/react-query';

const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  const invalidateProblemSet = (problemSetId: number) => {
    queryClient.invalidateQueries({
      queryKey: [
        $api.queryOptions('get', '/api/v1/problemSet/{problemSetId}', {
          params: {
            path: {
              problemSetId,
            },
          },
        }).queryKey,
        $api.queryOptions('get', '/api/v1/problemSet/search').queryKey,
        $api.queryOptions('get', '/api/v1/problemSet/confirm/search').queryKey,
      ],
    });
  };

  const invalidatePublish = (year: number, month: number) => {
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/v1/publish/{year}/{month}', {
        params: {
          path: {
            year,
            month,
          },
        },
      }).queryKey,
    });
  };

  return { invalidateAll, invalidateProblemSet, invalidatePublish };
};

export default useInvalidate;
