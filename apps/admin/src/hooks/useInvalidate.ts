import { $api } from '@apis';
import { useQueryClient } from '@tanstack/react-query';

const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  const invalidateProblemSet = (problemSetId: number) => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/problem-set/{id}', {
          params: {
            path: {
              id: problemSetId,
            },
          },
        }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/problem-set').queryKey,
      }),
    ]);
  };

  const invalidatePublish = (year: number, month: number) => {
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/publish', {
        params: {
          query: {
            year,
            month,
          },
        },
      }).queryKey,
    });
  };

  const invalidateNotice = () => {
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/notice').queryKey,
    });
  };

  return { invalidateAll, invalidateProblemSet, invalidatePublish, invalidateNotice };
};

export default useInvalidate;
