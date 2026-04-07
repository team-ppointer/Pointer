import { useEffect, useRef, useCallback, useState } from 'react';
import { components } from '@schema';

type QnAChatEvent = components['schemas']['QnAChatEvent'];
type QnAReadStatusEvent = components['schemas']['QnAReadStatusEvent'];

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type SSEEventHandlers = {
  onChatEvent?: (event: QnAChatEvent) => void;
  onReadStatusEvent?: (event: QnAReadStatusEvent) => void;
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

type UseSubscribeQnaOptions = {
  qnaId: number;
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

const useSubscribeQna = ({
  qnaId,
  token,
  enabled = true,
  reconnectConfig,
  onChatEvent,
  onReadStatusEvent,
  onHeartbeat,
  onError,
  onOpen,
  onConnectionStatusChange,
}: UseSubscribeQnaOptions) => {
  const config = { ...DEFAULT_RECONNECT_CONFIG, ...reconnectConfig };

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualDisconnectRef = useRef(false);

  // Callback refs — 연결 생명주기와 콜백 변경을 완전히 분리
  const onChatEventRef = useRef(onChatEvent);
  const onReadStatusEventRef = useRef(onReadStatusEvent);
  const onHeartbeatRef = useRef(onHeartbeat);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onConnectionStatusChangeRef = useRef(onConnectionStatusChange);

  // 콜백 refs를 최신 값으로 동기화
  useEffect(() => {
    onChatEventRef.current = onChatEvent;
  }, [onChatEvent]);
  useEffect(() => {
    onReadStatusEventRef.current = onReadStatusEvent;
  }, [onReadStatusEvent]);
  useEffect(() => {
    onHeartbeatRef.current = onHeartbeat;
  }, [onHeartbeat]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  useEffect(() => {
    onConnectionStatusChangeRef.current = onConnectionStatusChange;
  }, [onConnectionStatusChange]);

  // Refs for stable function references
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
      console.warn('[SSE] Heartbeat timeout - attempting reconnection');
      scheduleReconnectRef.current();
    }, config.heartbeatTimeout);
  }, [config.heartbeatTimeout]);

  // 재연결 예약 — ref를 통해 콜백 호출
  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) {
      console.log('[SSE] Manual disconnect - skipping reconnect');
      return;
    }

    if (retryCountRef.current >= config.maxRetries) {
      console.error('[SSE] Max retry attempts reached');
      updateConnectionStatus('disconnected');
      onErrorRef.current?.(new Error('Max reconnection attempts reached'));
      return;
    }

    const delay = getRetryDelay();
    console.log(
      `[SSE] Scheduling reconnect in ${Math.round(delay)}ms (attempt ${retryCountRef.current + 1}/${config.maxRetries})`
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
    if (!enabled || !qnaId || !token) {
      console.log('[SSE] Connection skipped - not enabled or missing params');
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

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${baseUrl}/api/qna/${qnaId}/subscribe?token=${encodeURIComponent(token)}`;

    console.log('[SSE] Connecting to:', url);

    const es = new EventSource(url);

    // 연결 성공
    es.onopen = () => {
      console.log('[SSE] Connection opened for QnA:', qnaId);
      retryCountRef.current = 0;
      updateConnectionStatus('connected');
      resetHeartbeatTimeout();
      onOpenRef.current?.();
    };

    // 메시지 이벤트 (디버깅용)
    es.onmessage = (event) => {
      console.log('[SSE] Message event:', event.data);
      resetHeartbeatTimeout();
    };

    // 에러 핸들링 — es 인스턴스를 검증하여 stale 핸들러 방지
    es.onerror = (event) => {
      console.error('[SSE] Error event:', event);

      // 이미 다른 연결로 교체되었으면 무시 (race condition 방지)
      if (eventSourceRef.current !== es) {
        es.close();
        return;
      }

      if (!isManualDisconnectRef.current) {
        onErrorRef.current?.(new Error('SSE connection error'));
        es.close();
        eventSourceRef.current = null;
        scheduleReconnectRef.current();
      }
    };

    // Chat 이벤트 (생성/수정/삭제)
    es.addEventListener('chat', (event) => {
      console.log('[SSE] Chat event:', event.data);
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAChatEvent;
          onChatEventRef.current?.(data);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse chat event:', error);
      }
      resetHeartbeatTimeout();
    });

    // 읽음 상태 이벤트
    es.addEventListener('read_status', (event) => {
      console.log('[SSE] Read status event:', event.data);
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAReadStatusEvent;
          onReadStatusEventRef.current?.(data);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse read_status event:', error);
      }
      resetHeartbeatTimeout();
    });

    // 하트비트 이벤트
    es.addEventListener('heartbeat', () => {
      console.log('[SSE] Heartbeat received');
      resetHeartbeatTimeout();
      onHeartbeatRef.current?.();
    });

    eventSourceRef.current = es;
  }, [enabled, qnaId, token, clearTimers, updateConnectionStatus, resetHeartbeatTimeout]);

  connectRef.current = connect;

  // 연결 해제 — ref를 통해 안정적
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearTimers();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('[SSE] Connection closed for QnA:', qnaId);
    }

    retryCountRef.current = 0;
    updateConnectionStatus('disconnected');
  }, [qnaId, clearTimers, updateConnectionStatus]);

  // 수동 재연결 (재시도 카운트 리셋)
  const reconnect = useCallback(() => {
    console.log('[SSE] Manual reconnect requested');
    retryCountRef.current = 0;
    isManualDisconnectRef.current = false;
    connectRef.current();
  }, []);

  // 브라우저 visibility 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && !isManualDisconnectRef.current) {
        console.log('[SSE] Page became visible - checking connection');
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          console.log('[SSE] Reconnecting...');
          retryCountRef.current = 0;
          connectRef.current();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SSE] Browser went online');
      if (enabled && !isManualDisconnectRef.current) {
        retryCountRef.current = 0;
        connectRef.current();
      }
    };

    const handleOffline = () => {
      console.log('[SSE] Browser went offline');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        updateConnectionStatus('disconnected');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, updateConnectionStatus]);

  // 단일 연결 effect — 마운트/파라미터 변경/언마운트를 하나로 통합
  useEffect(() => {
    if (enabled && qnaId && token) {
      connectRef.current();
    }

    return () => {
      // cleanup: 연결 해제
      isManualDisconnectRef.current = true;
      clearTimers();

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      retryCountRef.current = 0;
      updateConnectionStatus('disconnected');
    };
  }, [enabled, qnaId, token, clearTimers, updateConnectionStatus]);

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

export default useSubscribeQna;
export type { ConnectionStatus, ReconnectConfig };
