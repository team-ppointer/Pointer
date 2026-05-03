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
const stateSubscribers = new Set<() => void>();

/**
 * NavigationContainer 의 onReady prop 에 연결한다 (App.tsx).
 * navigationRef 가 attach 된 시점에 호출되어 대기 중인 subscriber 들을 깨운다.
 *
 * snapshot 후 fan-out — 각 handler 가 finish() 안에서 자기 자신을 delete 하므로
 * 반복 중 mutation 을 피하면서도 leak 없이 정리된다. clear() 를 하지 않는 이유는
 * Fast Refresh / container 재mount 시 onReady 가 다시 발화될 수 있어, 그 사이
 * 등록된 subscriber 가 손실되지 않도록 함이다.
 */
export const handleNavigationReady = () => {
  [...readySubscribers].forEach((cb) => cb());
};

/**
 * NavigationContainer 의 onStateChange prop 에 연결한다 (App.tsx).
 * Root state 가 변할 때마다 stateSubscribers 를 깨워 콜드스타트 직후 root route
 * (예: Splash → StudentApp) 가 교체되는 것을 감지한다.
 */
export const handleNavigationStateChange = () => {
  [...stateSubscribers].forEach((cb) => cb());
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
    let timer: ReturnType<typeof setTimeout>;

    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      readySubscribers.delete(handler);
      resolve(ready);
    };

    const handler = () => finish(navigationRef.isReady());

    readySubscribers.add(handler);
    timer = setTimeout(() => finish(false), timeoutMs);
  });
};

const isRouteRegistered = (routeName: keyof RootStackParamList): boolean => {
  if (!navigationRef.isReady()) return false;
  const state = navigationRef.getRootState();
  return state?.routes?.some((r) => r.name === routeName) ?? false;
};

/**
 * 특정 root route 가 RootNavigator 에 등록될 때까지 이벤트 기반으로 대기.
 *
 * RootNavigator 가 sessionStatus 에 따라 단일 root screen 만 등록하는 구조 (Splash |
 * Auth | StudentApp) 라, navigation ready 만 기다려서는 콜드스타트 직후 알림 딥링크가
 * 유실될 수 있다. 예) sessionStatus === 'hydrating' → Splash 만 등록 → StudentApp
 * 으로 navigate 하려 해도 silent no-op. 이 helper 는 onReady + onStateChange 를 모두
 * 구독해, 원하는 route 가 등록될 때까지 기다린다.
 *
 * - 이미 등록되어 있으면 즉시 resolve(true).
 * - timeoutMs 내에 등록 안 되면 resolve(false). (예: 사용자가 unauthenticated 인
 *   채로 알림을 받은 비정상 시나리오 — 이 경우 deep link 는 자연스럽게 폐기됨.)
 */
export const waitForRouteRegistered = (
  routeName: keyof RootStackParamList,
  timeoutMs = 30_000
): Promise<boolean> => {
  if (isRouteRegistered(routeName)) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      readySubscribers.delete(handler);
      stateSubscribers.delete(handler);
      resolve(ok);
    };

    const handler = () => {
      if (isRouteRegistered(routeName)) finish(true);
    };

    readySubscribers.add(handler);
    stateSubscribers.add(handler);
    timer = setTimeout(() => finish(false), timeoutMs);
  });
};
