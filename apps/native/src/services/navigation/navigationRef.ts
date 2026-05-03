import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from '@navigation/RootNavigator';

/**
 * 전역 네비게이션 참조
 * 컴포넌트 외부(예: 딥링크 핸들러, FCM 핸들러)에서 네비게이션을 수행할 때 사용
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * 네비게이션이 준비되었는지 확인
 */
export const isNavigationReady = () => navigationRef.isReady();

const readySubscribers = new Set<() => void>();

/**
 * NavigationContainer 의 onReady prop 에 연결한다 (App.tsx).
 * navigationRef 가 attach 된 시점에 호출되어 대기 중인 subscriber 들을 깨운다.
 */
export const handleNavigationReady = () => {
  // snapshot 후 호출 — 각 handler 가 finish() 안에서 자기 자신을 delete 하므로
  // 반복 중 mutation 을 피하면서도 leak 없이 정리된다. clear() 를 하지 않는 이유는
  // Fast Refresh / container 재mount 시 onReady 가 다시 발화될 수 있어, 그 사이
  // 등록된 subscriber 가 손실되지 않도록 함이다.
  [...readySubscribers].forEach((cb) => cb());
};

/**
 * navigationRef 가 준비될 때까지 이벤트 기반으로 대기.
 *
 * - 이미 ready 상태면 즉시 resolve(true).
 * - 그렇지 않으면 handleNavigationReady 가 호출될 때까지 module-level subscriber
 *   에 등록 (busy-wait polling 제거).
 * - timeoutMs 내에 ready 가 안 되면 resolve(false). 기본 30s — 저사양 기기의
 *   콜드 스타트 (>3s) 에서도 딥링크가 손실되지 않도록 여유 확보.
 *
 * NavigationContainer 가 mount 되기 전에 navigationRef.addListener 를 직접
 * 호출하면 throw 하므로, App 레벨 onReady prop 을 단일 fan-out 지점으로 사용.
 */
export const waitForNavigationReady = (timeoutMs = 30_000): Promise<boolean> => {
  if (navigationRef.isReady()) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const handler = () => finish(navigationRef.isReady());

    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      readySubscribers.delete(handler);
      resolve(ready);
    };

    readySubscribers.add(handler);
    const timer = setTimeout(() => finish(false), timeoutMs);
  });
};
