/**
 * `handwritingSaveQueue` 콜백을 React Query 캐시 + 사용자 인지 toast 에 연결하는 zero-UI 컴포넌트.
 * 반드시 `QueryClientProvider` 하위 + `ScrapDetailScreen` 안에 마운트.
 *
 * - onSaved: 서버 PUT 성공 직후 `get /handwriting` 캐시의 `dataJson` 갱신
 *   (single-device 가정 — invalidate 안 함)
 * - onAutosaveFailed: autosave / background 실패 시 1초 debounce toast
 *   (1초 안에 onSaved 가 들어오면 cancel — 일시적 5xx 의 깜박임 차단)
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { TanstackQueryClient } from '@apis';
import { type paths } from '@schema';

import { showToast } from '../components/Notification/Toast';

import { handwritingSaveQueue } from './handwritingSaveQueueSingleton';

type ScrapHandwritingResp =
  paths['/api/student/scrap/{scrapId}/handwriting']['get']['responses']['200']['content']['*/*'];

const TOAST_DEBOUNCE_MS = 1_000;

export function HandwritingSaveQueueWiring(): null {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    handwritingSaveQueue.setCallbacks({
      onSaved: ({ scrapId, data }) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        const queryKey = TanstackQueryClient.queryOptions(
          'get',
          '/api/student/scrap/{scrapId}/handwriting',
          {
            params: { path: { scrapId } },
          }
        ).queryKey;
        queryClient.setQueryData<ScrapHandwritingResp>(queryKey, (prev) => ({
          ...(prev ?? { scrapId }),
          dataJson: data,
          data: undefined,
        }));
      },
      onAutosaveFailed: () => {
        if (debounceTimerRef.current) return;
        debounceTimerRef.current = setTimeout(() => {
          showToast('error', '자동 저장에 실패했어요');
          debounceTimerRef.current = null;
        }, TOAST_DEBOUNCE_MS);
      },
    });

    return () => {
      handwritingSaveQueue.setCallbacks({});
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [queryClient]);

  return null;
}
