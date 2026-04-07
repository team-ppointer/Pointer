import { useCallback } from 'react';
import { $api } from '@apis';
import { useQueryClient } from '@tanstack/react-query';

const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const invalidateProblemSet = useCallback(
    (problemSetId: number) => {
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
    },
    [queryClient]
  );

  const invalidatePublish = useCallback(
    (year: number, month: number) => {
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
    },
    [queryClient]
  );

  const invalidateNotice = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/notice').queryKey,
    });
  }, [queryClient]);

  const invalidateQna = useCallback(
    (qnaId?: number) => {
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/api/admin/qna').queryKey,
        }),
      ];
      if (qnaId) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/admin/qna/{qnaId}', {
              params: { path: { qnaId } },
            }).queryKey,
          })
        );
      }
      return Promise.all(promises);
    },
    [queryClient]
  );

  return {
    invalidateAll,
    invalidateProblemSet,
    invalidatePublish,
    invalidateNotice,
    invalidateQna,
  };
};

export default useInvalidate;
