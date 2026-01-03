import { TanstackQueryClient } from '@apis';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const useInvalidateQnaData = () => {
  const queryClient = useQueryClient();

  const invalidateQnaList = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateQnaById = useCallback(
    (qnaId: number) => {
      return queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/{qnaId}', {
          params: {
            path: { qnaId },
          },
        }).queryKey,
      });
    },
    [queryClient]
  );

  const invalidateQnaImages = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/images', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateQnaImagesById = useCallback(
    (qnaId: number) => {
      return queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/{qnaId}/images', {
          params: {
            path: { qnaId },
          },
        }).queryKey,
      });
    },
    [queryClient]
  );

  const invalidateQnaAdminChat = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/admin-chat', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateAll = useCallback(
    (qnaId?: number) => {
      const tasks: Array<Promise<unknown>> = [
        invalidateQnaList(),
        invalidateQnaImages(),
        invalidateQnaAdminChat(),
      ];

      if (qnaId) {
        tasks.push(invalidateQnaById(qnaId));
        tasks.push(invalidateQnaImagesById(qnaId));
      }

      return Promise.all(tasks);
    },
    [
      invalidateQnaList,
      invalidateQnaById,
      invalidateQnaImages,
      invalidateQnaImagesById,
      invalidateQnaAdminChat,
    ]
  );

  return {
    invalidateQnaList,
    invalidateQnaById,
    invalidateQnaImages,
    invalidateQnaImagesById,
    invalidateQnaAdminChat,
    invalidateAll,
  };
};

export default useInvalidateQnaData;
