import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import EventSource from 'react-native-sse';

import { type components } from '@schema';
import { env } from '@utils';

type QnAListEvent = components['schemas']['QnAListEvent'];

// Custom event types for SSE (qna_list and heartbeat)
type CustomSSEEvents = 'qna_list' | 'heartbeat';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type SSEEventHandlers = {
  onQnaListEvent?: (event: QnAListEvent) => void;
  onHeartbeat?: () => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
};

type ReconnectConfig = {
  /** 최대 재시도 횟수 (기본값: 10) */
  maxRetries?: number;
  /** 초기 재시도 간격 (ms, 기본값: 1000) */
  initialDelay?: number;
  /** 최대 재시도 간격 (ms, 기본값: 30000) */
  maxDelay?: number;
  /** 하트비트 타임아웃 (ms, 기본값: 60000 - 1분) */
  heartbeatTimeout?: number;
};

type UseSubscribeQnaListOptions = {
  token: string;
  enabled?: boolean;
  reconnectConfig?: ReconnectConfig;
} & SSEEventHandlers;

const DEFAULT_RECONNECT_CONFIG: Required<ReconnectConfig> = {
  maxRetries: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  heartbeatTimeout: 60000,
};

const useSubscribeQnaList = ({
  token,
  enabled = true,
  reconnectConfig,
  onQnaListEvent,
  onHeartbeat,
  onError,
  onOpen,
  onConnectionStatusChange,
}: UseSubscribeQnaListOptions) => {
  const config = { ...DEFAULT_RECONNECT_CONFIG, ...reconnectConfig };

  const eventSourceRef = useRef<EventSource<CustomSSEEvents> | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualDisconnectRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isConnectedToNetworkRef = useRef<boolean>(true);

  // Callback refs — 연결 생명주기와 콜백 변경을 완전히 분리
  const onQnaListEventRef = useRef(onQnaListEvent);
  const onHeartbeatRef = useRef(onHeartbeat);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onConnectionStatusChangeRef = useRef(onConnectionStatusChange);

  useEffect(() => { onQnaListEventRef.current = onQnaListEvent; }, [onQnaListEvent]);
  useEffect(() => { onHeartbeatRef.current = onHeartbeat; }, [onHeartbeat]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onConnectionStatusChangeRef.current = onConnectionStatusChange; }, [onConnectionStatusChange]);

  // Refs for stable function references (to avoid circular dependencies)
  const connectRef = useRef<() => void>(() => {});
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // 연결 상태 변경 핸들러 — ref를 통해 콜백 호출
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionStatusChangeRef.current?.(status);
  }, []);

  // 재시도 지연 시간 계산 (지수 백오프)
  const getRetryDelay = useCallback(() => {
    const delay = Math.min(
      config.initialDelay * Math.pow(2, retryCountRef.current),
      config.maxDelay
    );
    return delay * (0.5 + Math.random());
  }, [config.initialDelay, config.maxDelay]);

  // 타이머 정리
  const clearTimers = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // 하트비트 타임아웃 리셋
  const resetHeartbeatTimeout = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    heartbeatTimeoutRef.current = setTimeout(() => {
      console.warn('[SSE QnaList] Heartbeat timeout - attempting reconnection');
      scheduleReconnectRef.current();
    }, config.heartbeatTimeout);
  }, [config.heartbeatTimeout]);

  // 재연결 예약 — ref를 통해 콜백 호출
  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) {
      console.log('[SSE QnaList] Manual disconnect - skipping reconnect');
      return;
    }

    if (!isConnectedToNetworkRef.current) {
      console.log('[SSE QnaList] No network connection - waiting for network');
      updateConnectionStatus('disconnected');
      return;
    }

    if (retryCountRef.current >= config.maxRetries) {
      console.error('[SSE QnaList] Max retry attempts reached');
      updateConnectionStatus('disconnected');
      onErrorRef.current?.(new Error('Max reconnection attempts reached'));
      return;
    }

    const delay = getRetryDelay();
    console.log(
      `[SSE QnaList] Scheduling reconnect in ${Math.round(delay)}ms (attempt ${retryCountRef.current + 1}/${config.maxRetries})`
    );
    updateConnectionStatus('reconnecting');

    retryTimeoutRef.current = setTimeout(() => {
      retryCountRef.current += 1;
      connectRef.current();
    }, delay);
  }, [config.maxRetries, getRetryDelay, updateConnectionStatus]);

  scheduleReconnectRef.current = scheduleReconnect;

  // 연결 — 콜백을 모두 ref로 참조하여 의존성에서 제거
  const connect = useCallback(() => {
    if (!enabled || !token) {
      console.log('[SSE QnaList] Connection skipped - not enabled or missing token');
      return;
    }

    if (!isConnectedToNetworkRef.current) {
      console.log('[SSE QnaList] No network connection - skipping connect');
      updateConnectionStatus('disconnected');
      return;
    }

    // 기존 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    clearTimers();
    isManualDisconnectRef.current = false;
    updateConnectionStatus('connecting');

    const url = `${env.apiBaseUrl}/api/qna/student/subscribe?token=${encodeURIComponent(token)}`;

    console.log('[SSE QnaList] Connecting to:', url);

    const es = new EventSource<CustomSSEEvents>(url, {
      headers: {
        Accept: 'text/event-stream',
      },
    });

    // 연결 성공
    es.addEventListener('open', () => {
      console.log('[SSE QnaList] Connection opened');
      retryCountRef.current = 0;
      updateConnectionStatus('connected');
      resetHeartbeatTimeout();
      onOpenRef.current?.();
    });

    // 메시지 이벤트 (디버깅용)
    es.addEventListener('message', () => {
      resetHeartbeatTimeout();
    });

    // QnA 리스트 변경 이벤트
    es.addEventListener('qna_list', (event) => {
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAListEvent;
          onQnaListEventRef.current?.(data);
        }
      } catch (error) {
        console.error('[SSE QnaList] Failed to parse qna_list event:', error);
      }
      resetHeartbeatTimeout();
    });

    // 하트비트 이벤트
    es.addEventListener('heartbeat', () => {
      resetHeartbeatTimeout();
      onHeartbeatRef.current?.();
    });

    // 에러 핸들링 — es 인스턴스를 검증하여 stale 핸들러 방지
    es.addEventListener('error', () => {
      // 이미 다른 연결로 교체되었으면 무시 (race condition 방지)
      if (eventSourceRef.current !== es) {
        es.close();
        return;
      }

      if (!isManualDisconnectRef.current) {
        onErrorRef.current?.(new Error('SSE connection error'));
        scheduleReconnectRef.current();
      }
    });

    eventSourceRef.current = es;
  }, [enabled, token, clearTimers, updateConnectionStatus, resetHeartbeatTimeout]);

  connectRef.current = connect;

  // 연결 해제
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearTimers();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('[SSE QnaList] Connection closed');
    }

    retryCountRef.current = 0;
    updateConnectionStatus('disconnected');
  }, [clearTimers, updateConnectionStatus]);

  // 수동 재연결 (재시도 카운트 리셋)
  const reconnect = useCallback(() => {
    console.log('[SSE QnaList] Manual reconnect requested');
    retryCountRef.current = 0;
    isManualDisconnectRef.current = false;
    connectRef.current();
  }, []);

  // 앱 상태 변경 감지
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasInBackground =
        appStateRef.current.match(/inactive|background/) && nextAppState === 'active';

      if (wasInBackground && enabled && !isManualDisconnectRef.current) {
        console.log('[SSE QnaList] App came to foreground - reconnecting');
        retryCountRef.current = 0;
        connectRef.current();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled]);

  // 네트워크 상태 변경 감지
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasDisconnected = !isConnectedToNetworkRef.current;
      isConnectedToNetworkRef.current = state.isConnected ?? false;

      // 네트워크 복구 시 재연결
      if (wasDisconnected && state.isConnected && enabled && !isManualDisconnectRef.current) {
        console.log('[SSE QnaList] Network restored - reconnecting');
        retryCountRef.current = 0;
        connectRef.current();
      }

      // 네트워크 끊김 시 연결 해제 (재시도 없이)
      if (!state.isConnected && eventSourceRef.current) {
        console.log('[SSE QnaList] Network lost - closing connection');
        clearTimers();
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        updateConnectionStatus('disconnected');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, clearTimers, updateConnectionStatus]);

  // 단일 연결 effect — 마운트/파라미터 변경/언마운트를 하나로 통합
  useEffect(() => {
    if (enabled && token) {
      connectRef.current();
    }

    return () => {
      isManualDisconnectRef.current = true;
      clearTimers();

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      retryCountRef.current = 0;
      updateConnectionStatus('disconnected');
    };
  }, [enabled, token, clearTimers, updateConnectionStatus]);

  return {
    /** 수동 재연결 (재시도 카운트 리셋) */
    reconnect,
    /** 연결 해제 */
    disconnect,
    /** 현재 연결 상태 */
    connectionStatus,
    /** 연결됨 여부 */
    isConnected: connectionStatus === 'connected',
    /** 재연결 중 여부 */
    isReconnecting: connectionStatus === 'reconnecting',
  };
};

export default useSubscribeQnaList;
export type { ConnectionStatus, ReconnectConfig, QnAListEvent };
