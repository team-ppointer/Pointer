import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { TanstackQueryClient } from '@/apis/client';

const useInvalidateNotificationData = () => {
  const queryClient = useQueryClient();

  const invalidateNotificationCount = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notification/count', {})
        .queryKey,
    });
  }, [queryClient]);

  const invalidateNotification = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notification', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateAll = useCallback(() => {
    return Promise.all([invalidateNotificationCount(), invalidateNotification()]);
  }, [invalidateNotificationCount, invalidateNotification]);

  return {
    invalidateNotificationCount,
    invalidateNotification,
    invalidateAll,
  };
};

export default useInvalidateNotificationData;
