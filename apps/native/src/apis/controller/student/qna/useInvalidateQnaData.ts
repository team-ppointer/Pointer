import { TanstackQueryClient } from '@/apis/client';
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

  const invalidateQnaFiles = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/files', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateQnaFilesById = useCallback(
    (qnaId: number) => {
      return queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/{qnaId}/files', {
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
        invalidateQnaFiles(),
        invalidateQnaAdminChat(),
      ];

      if (qnaId) {
        tasks.push(invalidateQnaById(qnaId));
        tasks.push(invalidateQnaFilesById(qnaId));
      }

      return Promise.all(tasks);
    },
    [
      invalidateQnaList,
      invalidateQnaById,
      invalidateQnaFiles,
      invalidateQnaFilesById,
      invalidateQnaAdminChat,
    ]
  );

  return {
    invalidateQnaList,
    invalidateQnaById,
    invalidateQnaImages: invalidateQnaFiles,
    invalidateQnaImagesById: invalidateQnaFilesById,
    invalidateQnaAdminChat,
    invalidateAll,
  };
};

export default useInvalidateQnaData;
