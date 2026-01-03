import { useEffect, useRef, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { components } from '@schema';
import { env } from '@utils';

type QnAChatEvent = components['schemas']['QnAChatEvent'];
type QnAReadStatusEvent = components['schemas']['QnAReadStatusEvent'];

type SSEEventHandlers = {
  onChatEvent?: (event: QnAChatEvent) => void;
  onReadStatusEvent?: (event: QnAReadStatusEvent) => void;
  onHeartbeat?: () => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
};

type UseSubscribeQnaOptions = {
  qnaId: number;
  token: string;
  enabled?: boolean;
} & SSEEventHandlers;

const useSubscribeQna = ({
  qnaId,
  token,
  enabled = true,
  onChatEvent,
  onReadStatusEvent,
  onHeartbeat,
  onError,
  onOpen,
}: UseSubscribeQnaOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !qnaId || !token) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${env.apiBaseUrl}/api/qna/${qnaId}/subscribe?token=${encodeURIComponent(token)}`;

    console.log('[SSE] Connecting to:', url);

    const es = new EventSource(url, {
      headers: {
        Accept: 'text/event-stream',
      },
    });

    // Connection opened
    es.addEventListener('open', (event) => {
      console.log('[SSE] ========== CONNECTION OPENED ==========');
      console.log('[SSE] QnA ID:', qnaId);
      console.log('[SSE] Open event:', JSON.stringify(event, null, 2));
      onOpen?.();
    });

    // Catch-all message event (for debugging - logs ALL incoming messages)
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
    });

    // Chat event (create/update/delete)
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
    });

    // Read status event
    es.addEventListener('read_status', (event) => {
      console.log('[SSE] ========== READ STATUS EVENT ==========');
      console.log('[SSE] Raw event:', JSON.stringify(event, null, 2));
      try {
        if (event.data) {
          const data = JSON.parse(event.data) as QnAReadStatusEvent;
          console.log('[SSE] Parsed read status data:', JSON.stringify(data, null, 2));
          onReadStatusEvent?.(data);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse read_status event:', error);
        console.error('[SSE] Raw data was:', event.data);
      }
    });

    // Heartbeat event
    es.addEventListener('heartbeat', (event) => {
      console.log('[SSE] ========== HEARTBEAT ==========');
      console.log('[SSE] Heartbeat event:', JSON.stringify(event, null, 2));
      onHeartbeat?.();
    });

    // Error handling
    es.addEventListener('error', (event) => {
      console.error('[SSE] ========== ERROR ==========');
      console.error('[SSE] Error event:', JSON.stringify(event, null, 2));
      onError?.(new Error('SSE connection error'));
    });

    eventSourceRef.current = es;
  }, [enabled, qnaId, token, onChatEvent, onReadStatusEvent, onHeartbeat, onError, onOpen]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('[SSE] Connection closed for QnA:', qnaId);
    }
  }, [qnaId]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    reconnect: connect,
    disconnect,
  };
};

export default useSubscribeQna;
