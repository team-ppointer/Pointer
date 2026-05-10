/**
 * 필기 매니저 — canvas 바인딩 / decode / autosave / explicit flush 오케스트레이션.
 *
 * 책임:
 * - canvas ref + mounted state (useImperativeHandle deps 우회용)
 * - 필기 데이터 로드 (decode)
 * - autosave (5s interval) / AppState background → 큐 enqueueAutosave
 * - explicit flush (onBack/swipe/탭) → 큐 flushExplicit + 결과별 Alert
 * - unmount cleanup → 큐 dequeue (화면 떠난 후 retry 안 함)
 *
 * 합의: 화면 떠나는 시점 = success or 사용자 명시 discard. 둘 중 하나로만 unmount.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { TanstackQueryClient, useGetHandwriting } from '@apis';

import { handwritingSaveQueue } from '../services';
import { type DrawingCanvasRef, type Stroke, type TextItem } from '../utils/skia/drawing';
import { decodeHandwritingData } from '../utils/handwritingDecoder';

import { runExplicitFlushLoop } from './handwritingFlushPending';

const AUTOSAVE_INTERVAL_MS = 5_000;

export interface UseHandwritingManagerProps {
  scrapId: number;
}

export function useHandwritingManager({ scrapId }: UseHandwritingManagerProps) {
  const { data: handwritingData, isLoading } = useGetHandwriting(scrapId, !!scrapId);
  const queryClient = useQueryClient();

  // canvas 인스턴스는 ref, mount 사실은 boolean state 로 분리.
  // useImperativeHandle (drawing.tsx) 가 deps 없이 매 render 마다 새 object 로 ref 를
  // 업데이트하므로 object 자체를 useState 에 담으면 무한 루프. boolean 은 dedupe 로 안전.
  const canvasRef = useRef<DrawingCanvasRef | null>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);
  const setCanvasRef = useCallback((node: DrawingCanvasRef | null) => {
    canvasRef.current = node;
    setCanvasMounted(node !== null);
  }, []);

  const needsSaveRef = useRef(false);
  const pendingLoadRef = useRef(false);
  const appliedScrapIdRef = useRef<number | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // scrapId 변경 시 reset
  useEffect(() => {
    appliedScrapIdRef.current = null;
    needsSaveRef.current = false;
    setDecodeError(null);
    pendingLoadRef.current = true;
    try {
      canvasRef.current?.clear();
    } finally {
      pendingLoadRef.current = false;
    }
  }, [scrapId]);

  // 데이터 로드 — canvas mount + handwritingData 도착 후
  useEffect(() => {
    if (handwritingData === undefined) return;
    if (appliedScrapIdRef.current === scrapId) return;
    if (!canvasMounted) return;
    try {
      const decoded = handwritingData
        ? decodeHandwritingData(handwritingData)
        : { strokes: [] as Stroke[], texts: [] as TextItem[] };
      pendingLoadRef.current = true;
      try {
        canvasRef.current?.setStrokes(decoded.strokes);
        canvasRef.current?.setTexts(decoded.texts);
      } finally {
        pendingLoadRef.current = false;
      }
      appliedScrapIdRef.current = scrapId;
      needsSaveRef.current = false;
    } catch (e) {
      console.error('[handwriting] decode failed', e);
      setDecodeError('필기를 불러오지 못했어요.');
    }
  }, [handwritingData, scrapId, canvasMounted]);

  // unmount cleanup — 화면 떠난 후 큐 retry 안 함 (인플라이트 PUT 응답은 stale guard 로 skip)
  useEffect(() => {
    return () => {
      handwritingSaveQueue.dequeue(scrapId);
    };
  }, [scrapId]);

  const markNeedsSave = useCallback(() => {
    if (pendingLoadRef.current) return;
    // load 적용 후에만 dirty. drawing.tsx 의 mount useEffect 가 1회 notifyHistoryChange 발화하는데
    // 그 시점에 reset effect 의 pendingLoadRef=true 윈도우가 이미 끝나있어서 이 가드가 없으면
    // needsSaveRef=true 잘못 set → 이후 load effect 가 needsSaveRef 가드로 server data skip → 빈 캔버스.
    if (appliedScrapIdRef.current !== scrapId) return;
    if (decodeError) return;
    needsSaveRef.current = true;
  }, [scrapId, decodeError]);

  const canFlush = useCallback((): boolean => {
    if (!needsSaveRef.current) return false;
    if (pendingLoadRef.current) return false;
    if (decodeError) return false;
    if (appliedScrapIdRef.current !== scrapId) return false;
    if (!canvasRef.current) return false;
    return true;
  }, [scrapId, decodeError]);

  const buildDataJson = useCallback((): string | null => {
    const c = canvasRef.current;
    if (!c) return null;
    return JSON.stringify({ strokes: c.getStrokes() ?? [], texts: c.getTexts() ?? [] });
  }, []);

  const handwritingQueryKey = useCallback(
    (id: number) =>
      TanstackQueryClient.queryOptions('get', '/api/student/scrap/{scrapId}/handwriting', {
        params: { path: { scrapId: id } },
      }).queryKey,
    []
  );

  const enqueueAutosave = useCallback(
    (source: 'autosave' | 'background') => {
      if (!canFlush()) return;
      const dataJson = buildDataJson();
      if (dataJson === null) return;
      handwritingSaveQueue.enqueueAutosave(scrapId, dataJson, source);
      needsSaveRef.current = false;
    },
    [scrapId, canFlush, buildDataJson]
  );

  // autosave 5s interval
  useEffect(() => {
    const id = setInterval(() => enqueueAutosave('autosave'), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enqueueAutosave]);

  // AppState background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') enqueueAutosave('background');
    });
    return () => sub.remove();
  }, [enqueueAutosave]);

  // explicit flush — onBack/swipe/탭/onTabClose/AllPointings 등 사용자 명시 의도.
  // 로컬 dirty 가 없어도 큐에 잔존 entry (autosave retry/hold) 가 있으면 명시 PUT 으로 끌고 간다.
  // autosave 실패 후 사용자가 떠나려고 할 때 silent loss 를 막고, 실패 시 Alert 로 사용자 결정 받음.
  const flushPending = useCallback(async (): Promise<void> => {
    const queueHasEntry = handwritingSaveQueue.has(scrapId);
    if (!queueHasEntry && !canFlush()) return;

    // PUT 못 만드는 케이스 — decode 실패 / canvas unmount → 큐만 정리
    if (decodeError || !canvasRef.current) {
      handwritingSaveQueue.dequeue(scrapId);
      return;
    }
    const dataJson = buildDataJson();
    if (dataJson === null) {
      handwritingSaveQueue.dequeue(scrapId);
      return;
    }

    await runExplicitFlushLoop({
      scrapId,
      dataJson,
      queue: handwritingSaveQueue,
      showRetryAlert: () =>
        new Promise<'retry' | 'discard'>((resolve) => {
          Alert.alert('저장에 실패했어요', '', [
            { text: '확인', style: 'destructive', onPress: () => resolve('discard') },
            { text: '다시 시도', onPress: () => resolve('retry') },
          ]);
        }),
      onDiscard: () => {
        queryClient.removeQueries({ queryKey: handwritingQueryKey(scrapId) });
      },
    });
    needsSaveRef.current = false;
  }, [scrapId, canFlush, buildDataJson, decodeError, handwritingQueryKey, queryClient]);

  const hasUnsavedChanges = useCallback(() => needsSaveRef.current, []);

  return {
    isLoading,
    decodeError,
    setCanvasRef,
    canvasRef,
    markNeedsSave,
    flushPending,
    hasUnsavedChanges,
  };
}
