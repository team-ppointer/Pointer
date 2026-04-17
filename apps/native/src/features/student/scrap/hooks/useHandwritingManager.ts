import { useEffect, useCallback, useRef } from 'react';
import { Alert, AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { useGetHandwriting, useUpdateHandwriting } from '@apis';

import { type DrawingCanvasRef } from '../utils/skia';
import { encodeHandwritingData, decodeHandwritingData } from '../utils/handwritingEncoder';

export interface UseHandwritingManagerProps {
  scrapId: number;
  canvasRef: React.RefObject<DrawingCanvasRef | null>;
  hasUnsavedChanges: boolean;
  strokeColor: string;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  onColorRestore?: (color: string) => void;
}

export function useHandwritingManager({
  scrapId,
  canvasRef,
  hasUnsavedChanges,
  strokeColor,
  onSaveSuccess,
  onSaveError,
  onColorRestore,
}: UseHandwritingManagerProps) {
  const { data: handwritingData, isLoading } = useGetHandwriting(scrapId, !!scrapId);
  const { mutate: updateHandwriting, isPending: isSaving } = useUpdateHandwriting();
  const lastSavedDataRef = useRef<string>('');
  const currentScrapIdRef = useRef<number>(scrapId);
  const initialLoadDoneRef = useRef(false);

  // scrapId가 변경되면 lastSavedDataRef 초기화
  useEffect(() => {
    if (currentScrapIdRef.current !== scrapId) {
      lastSavedDataRef.current = '';
      currentScrapIdRef.current = scrapId;
      initialLoadDoneRef.current = false;
    }
  }, [scrapId]);

  // 필기 데이터 로드
  useEffect(() => {
    // 저장 중이 아니고, scrapId가 일치할 때만 로드 (데이터 유실 방지)
    if (
      handwritingData?.data &&
      canvasRef.current &&
      currentScrapIdRef.current === scrapId &&
      !isSaving &&
      !initialLoadDoneRef.current
    ) {
      // clear() 완료를 보장하기 위해 약간의 지연 후 로드
      const loadTimer = setTimeout(() => {
        // 다시 한번 scrapId 확인 (clear() 실행 중일 수 있음)
        if (currentScrapIdRef.current === scrapId && canvasRef.current && !isSaving) {
          try {
            const decodedData = decodeHandwritingData(handwritingData.data);
            canvasRef.current.setStrokes(decodedData.strokes);
            if (decodedData.texts?.length > 0) {
              canvasRef.current.setTextBoxes(decodedData.texts);
            }
            if (decodedData.lastColor) {
              onColorRestore?.(decodedData.lastColor);
            }
            lastSavedDataRef.current = handwritingData.data;
            initialLoadDoneRef.current = true;
          } catch (error) {
            console.error('필기 데이터 로드 실패:', error);
          }
        }
      }, 50); // 50ms 지연으로 clear() 완료 보장

      return () => clearTimeout(loadTimer);
    }
  }, [handwritingData, canvasRef, scrapId]);

  // 실제 저장 로직 (encode + API call)
  const doSave = useCallback(
    (strokes: ReturnType<DrawingCanvasRef['getStrokes']>,
     textBoxes: ReturnType<DrawingCanvasRef['getTextBoxes']>,
     isAutoSave: boolean,
     targetScrapId?: number): Promise<boolean> => {
      try {
        const base64Data = encodeHandwritingData(strokes || [], textBoxes || [], strokeColor);

        if (base64Data === lastSavedDataRef.current) {
          if (!isAutoSave) {
            Alert.alert('알림', '변경사항이 없습니다.');
          }
          return Promise.resolve(true);
        }

        const saveScrapId = targetScrapId ?? scrapId;

        return new Promise<boolean>((resolve) => {
          updateHandwriting(
            {
              scrapId: saveScrapId,
              request: { data: base64Data },
            },
            {
              onSuccess: () => {
                lastSavedDataRef.current = base64Data;
                onSaveSuccess?.();
                if (!isAutoSave) {
                  Alert.alert('성공', '필기가 저장되었습니다.');
                }
                resolve(true);
              },
              onError: (error) => {
                console.error('필기 저장 실패:', error);
                onSaveError?.();
                if (!isAutoSave) {
                  Alert.alert('오류', '필기 저장에 실패했습니다.');
                }
                resolve(false);
              },
            }
          );
        });
      } catch (error) {
        console.error('필기 데이터 변환 실패:', error);
        if (!isAutoSave) {
          Alert.alert('오류', '필기 데이터 변환에 실패했습니다.');
        }
        return Promise.resolve(false);
      }
    },
    [scrapId, strokeColor, updateHandwriting, onSaveSuccess, onSaveError]
  );

  // 저장하기 함수
  const handleSave = useCallback(
    (isAutoSave = false, targetScrapId?: number) => {
      if (!canvasRef.current) return Promise.resolve(false);
      if (isSaving) return Promise.resolve(false);

      // 스냅샷은 즉시 캡처 (O(1) cache hit)
      const strokes = canvasRef.current.getStrokes();
      const textBoxes = canvasRef.current.getTextBoxes();

      if (!isAutoSave) {
        // 수동 저장: 즉시 실행 (유저가 기다리는 중)
        return doSave(strokes, textBoxes, false, targetScrapId);
      }

      // 자동 저장: interaction 끝난 후 실행 → 터치 이벤트와 같은 프레임에서 경쟁하지 않음
      return new Promise<boolean>((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          doSave(strokes, textBoxes, true, targetScrapId).then(resolve);
        });
      });
    },
    [canvasRef, isSaving, doSave]
  );

  // 5초마다 자동 저장
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    }, 5000); // 5초마다 실행

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isSaving, handleSave]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' && hasUnsavedChanges && !isSaving) {
        handleSave(true);
      }
    });
    return () => subscription.remove();
  }, [hasUnsavedChanges, isSaving, handleSave]);

  return {
    isLoading,
    isSaving,
    handleSave,
  };
}
