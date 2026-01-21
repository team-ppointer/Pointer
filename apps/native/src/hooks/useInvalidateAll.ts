import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const useInvalidateAll = () => {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(async () => {
    const categories = [
      '/api/student/diagnosis',
      '/api/student/me',
      '/api/student/notice',
      '/api/student/notification',
      '/api/student/scrap',
      '/api/student/study',
    ];

    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        // Check if the key follows the pattern ['get', path, ...] and path starts with one of the categories
        if (Array.isArray(key) && typeof key[1] === 'string') {
          const path = key[1];
          return categories.some((category) => path.startsWith(category));
        }
        return false;
      },
    });
  }, [queryClient]);

  return { invalidateAll };
};

export default useInvalidateAll;
