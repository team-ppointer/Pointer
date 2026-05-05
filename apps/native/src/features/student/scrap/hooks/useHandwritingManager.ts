import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useGetHandwriting, useUpdateHandwriting } from '@/apis';

import { showToast } from '../components/Notification/Toast';
import { type DrawingCanvasRef, type Stroke, type TextItem } from '../utils/skia/drawing';
import { decodeHandwritingData, encodeHandwritingData } from '../utils/handwritingEncoder';

const AUTOSAVE_INTERVAL_MS = 5000;
const FLUSH_TIMEOUT_MS = 5000;

type FlushDecision =
  | 'allow'
  | 'no-needs-save'
  | 'pending-load'
  | 'decode-error'
  | 'scrap-id-mismatch'
  | 'no-canvas';

type FlushContext = {
  needsSave: boolean;
  pendingLoad: boolean;
  decodeError: string | null;
  appliedScrapId: number | null;
  currentScrapId: number;
  hasCanvas: boolean;
};

type MarkContext = {
  pendingLoad: boolean;
  appliedScrapId: number | null;
  currentScrapId: number;
  decodeError: string | null;
};

function evaluateFlush(ctx: FlushContext): FlushDecision {
  if (!ctx.needsSave) return 'no-needs-save';
  if (ctx.pendingLoad) return 'pending-load';
  if (ctx.decodeError) return 'decode-error';
  if (ctx.appliedScrapId !== ctx.currentScrapId) return 'scrap-id-mismatch';
  if (!ctx.hasCanvas) return 'no-canvas';
  return 'allow';
}

function canMark(ctx: MarkContext): boolean {
  if (ctx.pendingLoad) return false;
  if (ctx.appliedScrapId !== ctx.currentScrapId) return false;
  if (ctx.decodeError) return false;
  return true;
}

export interface UseHandwritingManagerProps {
  scrapId: number;
}

export function useHandwritingManager({ scrapId }: UseHandwritingManagerProps) {
  const { data: handwritingData, isLoading } = useGetHandwriting(scrapId, !!scrapId);

  // canvas 인스턴스는 ref 로, mount 사실은 boolean state 로 분리.
  // useImperativeHandle (drawing.tsx) 가 deps 없이 매 render 마다 새 object
  // 로 ref 를 업데이트하므로 object 자체를 useState 에 담으면 매 render 마다
  // setState → 무한 루프. boolean 은 같은 값일 때 React 가 dedupe → 안전.
  const canvasRef = useRef<DrawingCanvasRef | null>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);
  const setCanvasRef = useCallback((node: DrawingCanvasRef | null) => {
    canvasRef.current = node;
    setCanvasMounted(node !== null);
  }, []);

  const updateMutation = useUpdateHandwriting();

  const needsSaveRef = useRef(false);
  const pendingLoadRef = useRef(false);
  const appliedScrapIdRef = useRef<number | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // decodeError / updateMutation 을 ref 로 미러링 — 콜백 deps 에서 제외해
  // 매 render 마다 새 reference 가 만들어지는 걸 막음 (DrawingCanvas 의
  // notifyHistoryChange 가 prop 변경에 따라 새 reference 가 되어 캔버스 내부
  // useEffect 가 재발화 → onHistoryChange 콜백 호출 → setState → 무한 루프).
  const decodeErrorRef = useRef<string | null>(null);
  decodeErrorRef.current = decodeError;
  const updateMutationRef = useRef(updateMutation);
  updateMutationRef.current = updateMutation;

  const applyData = useCallback(
    (strokes: Stroke[], texts: TextItem[]) => {
      const c = canvasRef.current;
      if (!c) return;
      pendingLoadRef.current = true;
      try {
        c.setStrokes(strokes);
        c.setTexts(texts);
      } finally {
        pendingLoadRef.current = false;
      }
      appliedScrapIdRef.current = scrapId;
      needsSaveRef.current = false;
    },
    [scrapId]
  );

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

  useEffect(() => {
    if (handwritingData === undefined) return;
    if (appliedScrapIdRef.current === scrapId) return;
    if (!canvasMounted) return;
    try {
      const decoded = handwritingData?.data
        ? decodeHandwritingData(handwritingData.data)
        : { strokes: [] as Stroke[], texts: [] as TextItem[] };
      applyData(decoded.strokes, decoded.texts);
    } catch (e) {
      console.error('[handwriting] decode failed', e);
      setDecodeError('필기를 불러오지 못했어요.');
    }
  }, [handwritingData, scrapId, applyData, canvasMounted]);

  const markNeedsSave = useCallback(() => {
    if (
      !canMark({
        pendingLoad: pendingLoadRef.current,
        appliedScrapId: appliedScrapIdRef.current,
        currentScrapId: scrapId,
        decodeError: decodeErrorRef.current,
      })
    )
      return;
    needsSaveRef.current = true;
  }, [scrapId]);

  const flushFireAndForget = useCallback(() => {
    const c = canvasRef.current;
    const decision = evaluateFlush({
      needsSave: needsSaveRef.current,
      pendingLoad: pendingLoadRef.current,
      decodeError: decodeErrorRef.current,
      appliedScrapId: appliedScrapIdRef.current,
      currentScrapId: scrapId,
      hasCanvas: !!c,
    });
    if (decision !== 'allow' || !c) return;
    const data = encodeHandwritingData(c.getStrokes() ?? [], c.getTexts() ?? []);
    needsSaveRef.current = false;
    updateMutationRef.current.mutate(
      { scrapId, request: { data } },
      {
        // autosave 는 silent — 토스트 없이 다음 interval 에 재시도
        onError: () => {
          needsSaveRef.current = true;
        },
      }
    );
  }, [scrapId]);

  const flushPending = useCallback(async (): Promise<void> => {
    const c = canvasRef.current;
    const decision = evaluateFlush({
      needsSave: needsSaveRef.current,
      pendingLoad: pendingLoadRef.current,
      decodeError: decodeErrorRef.current,
      appliedScrapId: appliedScrapIdRef.current,
      currentScrapId: scrapId,
      hasCanvas: !!c,
    });
    if (decision !== 'allow' || !c) return;

    const data = encodeHandwritingData(c.getStrokes() ?? [], c.getTexts() ?? []);
    needsSaveRef.current = false;

    try {
      await Promise.race([
        updateMutationRef.current.mutateAsync({ scrapId, request: { data } }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('flush-timeout')), FLUSH_TIMEOUT_MS)
        ),
      ]);
    } catch {
      needsSaveRef.current = true;
      showToast('error', '저장에 실패했어요');
    }
  }, [scrapId]);

  const flushFireAndForgetRef = useRef(flushFireAndForget);
  flushFireAndForgetRef.current = flushFireAndForget;

  useEffect(() => {
    const id = setInterval(() => flushFireAndForgetRef.current(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const flushPendingRef = useRef(flushPending);
  flushPendingRef.current = flushPending;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') void flushPendingRef.current();
    });
    return () => sub.remove();
  }, []);

  return {
    isLoading,
    decodeError,
    markNeedsSave,
    flushPending,
    setCanvasRef,
    canvasRef,
  };
}
