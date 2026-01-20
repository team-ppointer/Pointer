import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import EventSource from 'react-native-sse';
import { components } from '@schema';
import { env } from '@utils';

type QnAChatEvent = components['schemas']['QnAChatEvent'];
type QnAReadStatusEvent = components['schemas']['QnAReadStatusEvent'];

// Custom event types for SSE (chat, read_status, heartbeat)
type CustomSSEEvents = 'chat' | 'read_status' | 'heartbeat';

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

  const eventSourceRef = useRef<EventSource<CustomSSEEvents> | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualDisconnectRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isConnectedToNetworkRef = useRef(true);

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

    if (!isConnectedToNetworkRef.current) {
      console.log('[SSE] No network connection - waiting for network');
      updateConnectionStatus('disconnected');
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

    if (!isConnectedToNetworkRef.current) {
      console.log('[SSE] No network connection - skipping connect');
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

    const url = `${env.apiBaseUrl}/api/qna/${qnaId}/subscribe?token=${encodeURIComponent(token)}`;

    console.log('[SSE] Connecting to:', url);

    const es = new EventSource<CustomSSEEvents>(url, {
      headers: {
        Accept: 'text/event-stream',
      },
    });

    // 연결 성공
    es.addEventListener('open', (event) => {
      console.log('[SSE] ========== CONNECTION OPENED ==========');
      console.log('[SSE] QnA ID:', qnaId);
      console.log('[SSE] Open event:', JSON.stringify(event, null, 2));

      retryCountRef.current = 0; // 재시도 카운트 리셋
      updateConnectionStatus('connected');
      resetHeartbeatTimeout();
      onOpen?.();
    });

    // 메시지 이벤트 (디버깅용)
    es.addEventListener('message', (event) => {
      console.log('[SSE] ========== MESSAGE EVENT ==========');
      console.log('[SSE] Event type:', event.type);
      console.log('[SSE] Event data (raw):', event.data);
      try {
        if (event.data) {
          const parsed = JSON.parse(event.data);
          console.log('[SSE] Event data (parsed):', JSON.stringify(parsed, null, 2));
        }
      } catch {
        console.log('[SSE] Event data is not JSON');
      }
      resetHeartbeatTimeout();
    });

    // Chat 이벤트 (생성/수정/삭제)
    es.addEventListener('chat', (event) => {
      console.log('[SSE] ========== CHAT EVENT ==========');
      console.log('[SSE] Raw event:', JSON.stringify(event, null, 2));
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAChatEvent;
          console.log('[SSE] Parsed chat data:', JSON.stringify(data, null, 2));
          onChatEvent?.(data);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse chat event:', error);
        console.error('[SSE] Raw data was:', event.data);
      }
      resetHeartbeatTimeout();
    });

    // 읽음 상태 이벤트 (deduplication by readAt timestamp)
    let lastReadStatusKey = '';
    es.addEventListener('read_status', (event) => {
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAReadStatusEvent;
          
          // Deduplicate by creating a unique key from the event data
          const eventKey = `${data.qnaId}-${data.userId}-${data.readAt}`;
          if (eventKey === lastReadStatusKey) {
            // Skip duplicate event (only log once per unique event)
            return;
          }
          lastReadStatusKey = eventKey;
          
          // Only log if there's a callback registered
          if (onReadStatusEvent) {
            console.log('[SSE] Read status event:', JSON.stringify(data, null, 2));
            onReadStatusEvent(data);
          }
        }
      } catch (error) {
        console.error('[SSE] Failed to parse read_status event:', error);
      }
      resetHeartbeatTimeout();
    });

    // 하트비트 이벤트
    es.addEventListener('heartbeat', (event) => {
      console.log('[SSE] ========== HEARTBEAT ==========');
      console.log('[SSE] Heartbeat event:', JSON.stringify(event, null, 2));
      resetHeartbeatTimeout();
      onHeartbeat?.();
    });

    // 에러 핸들링
    es.addEventListener('error', (event) => {
      console.error('[SSE] ========== ERROR ==========');
      console.error('[SSE] Error event:', JSON.stringify(event, null, 2));

      if (!isManualDisconnectRef.current) {
        onError?.(new Error('SSE connection error'));
        scheduleReconnectRef.current();
      }
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

  // 앱 상태 변경 감지
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasInBackground =
        appStateRef.current.match(/inactive|background/) && nextAppState === 'active';

      if (wasInBackground && enabled && !isManualDisconnectRef.current) {
        console.log('[SSE] App came to foreground - reconnecting');
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

      console.log('[SSE] Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
      });

      // 네트워크 복구 시 재연결
      if (wasDisconnected && state.isConnected && enabled && !isManualDisconnectRef.current) {
        console.log('[SSE] Network restored - reconnecting');
        retryCountRef.current = 0;
        connectRef.current();
      }

      // 네트워크 끊김 시 연결 해제 (재시도 없이)
      if (!state.isConnected && eventSourceRef.current) {
        console.log('[SSE] Network lost - closing connection');
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
