import { TanstackQueryClient } from '@apis';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const parsePublishDate = (publishAt?: string) => {
  if (!publishAt) {
    return undefined;
  }
  const date = new Date(publishAt);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
};

const useInvalidateStudyData = () => {
  const queryClient = useQueryClient();

  const invalidateStudyData = useCallback(
    (publishId?: number, publishAt?: string) => {
      const tasks: Array<Promise<unknown>> = [];

      if (publishId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: TanstackQueryClient.queryOptions(
              'get',
              '/api/student/study/publish/detail/{id}',
              {
                params: {
                  path: {
                    id: publishId,
                  },
                },
              }
            ).queryKey,
          })
        );
      }

      const publishDate = parsePublishDate(publishAt);
      if (publishDate) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: TanstackQueryClient.queryOptions(
              'get',
              '/api/student/study/publish/monthly',
              {
                params: {
                  query: {
                    year: publishDate.year,
                    month: publishDate.month,
                  },
                },
              }
            ).queryKey,
          })
        );
      }

      if (tasks.length === 0) {
        return Promise.resolve();
      }

      return Promise.all(tasks);
    },
    [queryClient]
  );

  return { invalidateStudyData };
};

export default useInvalidateStudyData;
