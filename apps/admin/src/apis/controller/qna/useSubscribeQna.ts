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

  // Refs for stable function references (to avoid circular dependencies)
  const connectRef = useRef<() => void>(() => {});
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // 연결 상태 변경 핸들러
  const updateConnectionStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionStatusChange?.(status);
    },
    [onConnectionStatusChange]
  );

  // 재시도 지연 시간 계산 (지수 백오프)
  const getRetryDelay = useCallback(() => {
    const delay = Math.min(
      config.initialDelay * Math.pow(2, retryCountRef.current),
      config.maxDelay
    );
    // 약간의 랜덤 지터 추가 (0.5 ~ 1.5 배)
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

  // 재연결 예약
  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) {
      console.log('[SSE] Manual disconnect - skipping reconnect');
      return;
    }

    if (retryCountRef.current >= config.maxRetries) {
      console.error('[SSE] Max retry attempts reached');
      updateConnectionStatus('disconnected');
      onError?.(new Error('Max reconnection attempts reached'));
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
  }, [config.maxRetries, getRetryDelay, updateConnectionStatus, onError]);

  // Update ref
  scheduleReconnectRef.current = scheduleReconnect;

  // 연결
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
      onOpen?.();
    };

    // 메시지 이벤트 (디버깅용)
    es.onmessage = (event) => {
      console.log('[SSE] Message event:', event.data);
      resetHeartbeatTimeout();
    };

    // 에러 핸들링
    es.onerror = (event) => {
      console.error('[SSE] Error event:', event);

      if (!isManualDisconnectRef.current) {
        onError?.(new Error('SSE connection error'));
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
          onChatEvent?.(data);
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
          onReadStatusEvent?.(data);
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
      onHeartbeat?.();
    });

    eventSourceRef.current = es;
  }, [
    enabled,
    qnaId,
    token,
    clearTimers,
    updateConnectionStatus,
    resetHeartbeatTimeout,
    onChatEvent,
    onReadStatusEvent,
    onHeartbeat,
    onError,
    onOpen,
  ]);

  // Update ref
  connectRef.current = connect;

  // 연결 해제
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

  // 마운트 시 연결, 언마운트 시 해제
  useEffect(() => {
    connectRef.current();

    return () => {
      disconnect();
    };
  }, [disconnect]);

  // enabled 또는 핵심 파라미터 변경 시 재연결
  useEffect(() => {
    if (enabled && qnaId && token) {
      connectRef.current();
    } else {
      disconnect();
    }
  }, [enabled, qnaId, token, disconnect]);

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

