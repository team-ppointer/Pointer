import { TanstackQueryClient } from '@/apis/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const useInvalidateNoticeData = () => {
  const queryClient = useQueryClient();

  const invalidateNoticeCount = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notice/count', {})
        .queryKey,
    });
  }, [queryClient]);

  const invalidateNotice = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: TanstackQueryClient.queryOptions('get', '/api/student/notice', {}).queryKey,
    });
  }, [queryClient]);

  const invalidateAll = useCallback(() => {
    return Promise.all([invalidateNoticeCount(), invalidateNotice()]);
  }, [invalidateNoticeCount, invalidateNotice]);

  return {
    invalidateNoticeCount,
    invalidateNotice,
    invalidateAll,
  };
};

export default useInvalidateNoticeData;
