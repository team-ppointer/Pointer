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

  const invalidateDailyComment = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/daily-comments').queryKey,
    });
  }, [queryClient]);

  const invalidateMockExamResults = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/mock-exam').queryKey,
    });
  }, [queryClient]);

  const invalidateMockExamTypes = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/mock-exam/types').queryKey,
    });
  }, [queryClient]);

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

  const invalidateFocusCardList = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/api/admin/focus-card').queryKey,
    });
  }, [queryClient]);

  const invalidateFocusCard = useCallback(
    (id: number) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/api/admin/focus-card/{id}', {
            params: { path: { id } },
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/api/admin/focus-card').queryKey,
        }),
      ]);
    },
    [queryClient]
  );

  const invalidateFocusCardIssuanceByDate = useCallback(
    (studentId: number, issuedDate?: string) => {
      return queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/focus-card/issuance/by-date', {
          params: {
            query: {
              studentId,
              ...(issuedDate ? { issuedDate } : {}),
            },
          },
        }).queryKey,
      });
    },
    [queryClient]
  );

  const invalidatePublishDetail = useCallback(
    (publishId: number) => {
      return queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/publish/{id}', {
          params: { path: { id: publishId } },
        }).queryKey,
      });
    },
    [queryClient]
  );

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
      // 노드/엣지 시트의 row 라벨, 액션 그래프 pivot 컬럼이 type 의 label/code 를
      // 직접 임베드하므로 type 변경 시 시트 캐시도 함께 무효화한다.
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/node').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/edge').queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/api/admin/concept/graph/sheet/action-edge').queryKey,
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
    invalidateDailyComment,
    invalidateMockExamResults,
    invalidateMockExamTypes,
    invalidateConceptGraphSheets,
    invalidateConceptGraphNodes,
    invalidateConceptGraphEdges,
    invalidateConceptGraphActionEdges,
    invalidateConceptGraphTypes,
    invalidateFocusCardList,
    invalidateFocusCard,
    invalidateFocusCardIssuanceByDate,
    invalidatePublishDetail,
  };
};

export default useInvalidate;
