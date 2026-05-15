import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { focusCardQueries } from '@apis/controller/student/focusCard';
import { formatDateKey } from '@utils/date';
import type { components } from '@schema';

type FocusCardIssuanceResp = components['schemas']['FocusCardIssuanceResp'];

/**
 * 홈 화면용 집중학습 카드 — 오늘 + 내일 발급분을 합쳐 반환.
 *
 * TODO: 백엔드가 `from`/`to` 범위 endpoint를 제공하면 단일 쿼리로 교체.
 *       현재는 임시 join.
 */
export function useHomeFocusCards(today: Date): {
  data: FocusCardIssuanceResp[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} {
  const todayStr = formatDateKey(today);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const tomorrowStr = formatDateKey(tomorrow);

  const [todayQuery, tomorrowQuery] = useQueries({
    queries: [focusCardQueries.byDate(todayStr), focusCardQueries.byDate(tomorrowStr)],
  });

  const data = useMemo(
    () => [...(todayQuery.data ?? []), ...(tomorrowQuery.data ?? [])],
    [todayQuery.data, tomorrowQuery.data]
  );

  return {
    data,
    isPending: todayQuery.isPending || tomorrowQuery.isPending,
    isError: todayQuery.isError || tomorrowQuery.isError,
    error: todayQuery.error ?? tomorrowQuery.error ?? null,
  };
}
