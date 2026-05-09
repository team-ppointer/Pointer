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

  const invalidateNotification = useCallback(
    (studentId: number) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/notification', {
          params: {
            query: {
              studentId,
            },
          },
        }).queryKey,
      });
    },
    [queryClient]
  );

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

  const invalidateConceptGraphSheets = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/node').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/action-edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/node-type').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/edge-type').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/action-edge-type').queryKey,
      }),
    ]);
  }, [queryClient]);

  const invalidateConceptGraphNodes = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/node').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/node').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/action-edge').queryKey,
      }),
    ]);
  }, [queryClient]);

  const invalidateConceptGraphEdges = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/edge').queryKey,
      }),
    ]);
  }, [queryClient]);

  const invalidateConceptGraphActionEdges = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/action-edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/action-edge').queryKey,
      }),
    ]);
  }, [queryClient]);

  const invalidateConceptGraphTypes = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/node-type').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/edge-type').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/action-edge-type').queryKey,
      }),
    ]);
  }, [queryClient]);

  return {
    invalidateAll,
    invalidateProblemSet,
    invalidatePublish,
    invalidateNotice,
    invalidateNotification,
    invalidateQna,
    invalidateConceptGraphSheets,
    invalidateConceptGraphNodes,
    invalidateConceptGraphEdges,
    invalidateConceptGraphActionEdges,
    invalidateConceptGraphTypes,
  };
};

export default useInvalidate;
