import { useEffect } from 'react';
import * as Updates from 'expo-updates';

/**
 * OTA 업데이트 체크 및 적용 훅.
 * 앱 시작 시 백그라운드에서 업데이트를 확인하고,
 * 새 업데이트가 있으면 다음 앱 실행 시 자동 적용.
 */
const useOTAUpdate = () => {
  useEffect(() => {
    // 개발 환경에서는 스킵
    if (__DEV__) return;

    const checkForUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // 기본: 다음 앱 실행 시 적용
          // 즉시 적용이 필요하면 아래 주석 해제:
          // await Updates.reloadAsync();
        }
      } catch (error) {
        // 업데이트 체크 실패는 무시 (네트워크 오류 등)
        console.warn('OTA 업데이트 체크 실패:', error);
      }
    };

    checkForUpdate();
  }, []);
};

export default useOTAUpdate;
