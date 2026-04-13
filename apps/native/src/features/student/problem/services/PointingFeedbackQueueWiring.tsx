/**
 * `pointingFeedbackQueue` 의 성공 콜백을 React Query `invalidateQueries` 와
 * 연결하는 zero-UI 컴포넌트. 반드시 `QueryClientProvider` 하위에 마운트해야 한다.
 *
 * 큐가 서버 응답 성공을 반영한 직후 `publish/detail` 쿼리를 invalidate 하여
 * store 가 서버 신뢰 상태로 수렴하도록 한다(큐 merge 로 UI 는 이미 일관, 이쪽은 장기 정합성용).
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { TanstackQueryClient } from '@apis';

import { pointingFeedbackQueue } from './index';

export function PointingFeedbackQueueWiring(): null {
  const queryClient = useQueryClient();

  useEffect(() => {
    pointingFeedbackQueue.setOnSuccess((entry) => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions(
          'get',
          '/api/student/study/publish/detail/{id}',
          {
            params: {
              path: {
                id: entry.publishId,
              },
            },
          }
        ).queryKey,
      });
    });

    return () => {
      pointingFeedbackQueue.setOnSuccess(undefined);
    };
  }, [queryClient]);

  return null;
}
