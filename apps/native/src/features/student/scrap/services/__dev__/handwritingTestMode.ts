/**
 * 필기 저장 테스트 모드 — dev only.
 *
 * RN 디버거 콘솔에서 `globalThis.setHwTestMode('retry')` 등 호출하여 모드 전환.
 * `applyHwTestMode()` 가 null 아닌 값 반환 시 실제 PUT 안 보내고 그 outcome 시뮬레이션.
 *
 * 시나리오 검증 가이드:
 * - 'hold'         → autosave: 1초 debounce toast (10s 후 retry) / explicit: Alert (재시도/확인)
 * - 'retry'        → autosave: backoff (1s/2s/4s/8s/16s/30s) + 1초 debounce toast / explicit: Alert
 * - 'network_error'→ retry 와 동일 (fetch throw)
 * - 'slow_2s'      → 2초 응답 지연. 사용자가 그 사이 onBack 누르면 race 시나리오 (큐 inflight + flushExplicit) 검증
 * - 'slow_6s'      → 6초 응답 지연 → flushExplicit 5초 timeout 발동 → Alert (재시도/확인)
 * - 'normal'       → 모드 해제 (실제 서버 통신)
 */
import type { FlushOutcome } from '../handwritingSaveQueue';

export type HwTestMode = 'normal' | 'hold' | 'retry' | 'network_error' | 'slow_2s' | 'slow_6s';

let currentMode: HwTestMode = 'normal';

export function getHwTestMode(): HwTestMode {
  return currentMode;
}

export function setHwTestMode(mode: HwTestMode): void {
  currentMode = mode;
  console.log('[handwriting test mode]', mode);
}

if (__DEV__) {
  (globalThis as unknown as { setHwTestMode: typeof setHwTestMode }).setHwTestMode = setHwTestMode;
  console.log(
    '[handwriting test mode] available — globalThis.setHwTestMode(' +
      "'hold' | 'retry' | 'network_error' | 'slow_2s' | 'slow_6s' | 'normal'" +
      ')'
  );
}

/**
 * 모드별 응답 시뮬레이션.
 * @returns FlushOutcome 시뮬레이션 (즉시 outcome 반환) / null (실제 PUT 진행)
 * @throws 'network_error' 모드에서 throw
 */
export async function applyHwTestMode(): Promise<FlushOutcome | null> {
  switch (currentMode) {
    case 'normal':
      return null;
    case 'hold':
      return 'hold';
    case 'retry':
      return 'retry';
    case 'network_error':
      throw new Error('[hw test mode] simulated network error');
    case 'slow_2s':
      await new Promise((r) => setTimeout(r, 2_000));
      return null;
    case 'slow_6s':
      await new Promise((r) => setTimeout(r, 6_000));
      return null;
  }
}
