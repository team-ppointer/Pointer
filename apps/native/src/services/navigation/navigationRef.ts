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
