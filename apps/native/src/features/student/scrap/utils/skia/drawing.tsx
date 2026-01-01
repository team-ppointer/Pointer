import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
  Text as RNText,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import {
  Canvas,
  Path,
  SkPath,
  Skia,
  Text,
  useFont,
  Circle,
  Group,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { buildSmoothPath } from '../../utils/skia/smoothing';

export type Point = { x: number; y: number };
export type Stroke = { points: Point[]; color: string; width: number };
export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};
export type DrawingCanvasRef = {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  getTexts: () => TextItem[];
  setTexts: (texts: TextItem[]) => void;
};

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
  eraserMode?: boolean;
  eraserSize?: number;
  textMode?: boolean;
  textFontSize?: number;
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
  (
    {
      strokeColor = 'black',
      strokeWidth = 3,
      onChange,
      eraserMode = false,
      eraserSize = 20,
      textMode = false,
      textFontSize = 32,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<SkPath[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [, setTick] = useState(0);
    const [activeTextInput, setActiveTextInput] = useState<{
      id: string;
      x: number;
      y: number;
      value: string;
    } | null>(null);
    const textInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const containerLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(
      null
    );
    const canvasHeight = useRef<number>(800); // 기본 캔버스 높이
    const maxY = useRef<number>(0); // 그려진 내용의 최대 Y 좌표
    const keyboardHeight = useRef<number>(0); // 키보드 높이

    // 호버 좌표를 저장할 SharedValue (성능을 위해 스레드 분리)
    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const textsRef = useRef<TextItem[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 히스토리 관리 (모든 동작에 대한 undo 지원)
    type HistoryState = { strokes: Stroke[]; texts: TextItem[] };
    const historyRef = useRef<HistoryState[]>([]);
    const historyIndexRef = useRef<number>(-1);

    // 현재 상태를 히스토리에 저장
    const saveToHistory = useCallback(() => {
      const currentState: HistoryState = {
        strokes: JSON.parse(JSON.stringify(strokesRef.current)), // deep copy
        texts: JSON.parse(JSON.stringify(textsRef.current)), // deep copy
      };

      // 현재 인덱스 이후의 히스토리 제거 (새 동작이 발생하면 redo 불가)
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);

      // 새 상태 추가
      historyRef.current.push(currentState);
      historyIndexRef.current = historyRef.current.length - 1;

      // 히스토리 크기 제한 (메모리 관리)
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
    }, []);

    // 히스토리에서 상태 복원
    const restoreFromHistory = useCallback(
      (index: number) => {
        if (index < 0 || index >= historyRef.current.length) return;

        const state = historyRef.current[index];
        const newPaths = state.strokes.map((stroke) => buildSmoothPath(stroke.points));

        setStrokes(state.strokes);
        setPaths(newPaths);
        setTexts(state.texts);
        strokesRef.current = state.strokes;
        textsRef.current = state.texts;

        // 최대 Y 좌표 재계산
        let maxYValue = 0;
        if (state.strokes.length > 0) {
          const strokesMaxY = Math.max(
            ...state.strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxYValue = Math.max(maxYValue, strokesMaxY);
        }
        if (state.texts.length > 0) {
          const textsMaxY = Math.max(...state.texts.map((text) => text.y));
          maxYValue = Math.max(maxYValue, textsMaxY);
        }

        if (maxYValue > 0) {
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxY.current + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(state.strokes);
        setTick((t) => t + 1);
      },
      [onChange]
    );

    // 폰트 로드
    const font = useFont(require('@assets/fonts/PretendardVariable.ttf'), textFontSize);

    const loadStrokes = useCallback(
      (newStrokes: Stroke[]) => {
        // strokes와 paths를 함께 업데이트
        const newPaths = newStrokes.map((stroke) => buildSmoothPath(stroke.points));
        setStrokes(newStrokes);
        setPaths(newPaths);
        strokesRef.current = newStrokes;

        // 최대 Y 좌표 계산
        if (newStrokes.length > 0) {
          const maxYValue = Math.max(
            ...newStrokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxYValue + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        setTick((t) => t + 1);
        onChange?.(newStrokes);

        // 히스토리 초기화 및 초기 상태 저장 (외부에서 로드한 경우)
        historyRef.current = [];
        historyIndexRef.current = -1;
        // 초기 상태를 히스토리에 저장
        setTimeout(() => {
          const initialState: HistoryState = {
            strokes: JSON.parse(JSON.stringify(newStrokes)),
            texts: JSON.parse(JSON.stringify(textsRef.current)),
          };
          historyRef.current = [initialState];
          historyIndexRef.current = 0;
        }, 0);
      },
      [onChange]
    );

    const loadTexts = useCallback((newTexts: TextItem[]) => {
      setTexts(newTexts);
      textsRef.current = newTexts;

      // 최대 Y 좌표 계산 (strokes와 texts 모두 고려)
      let maxYValue = 0;

      // strokes의 최대 Y 계산
      if (strokesRef.current.length > 0) {
        const strokesMaxY = Math.max(
          ...strokesRef.current.flatMap((stroke) => stroke.points.map((p) => p.y))
        );
        maxYValue = Math.max(maxYValue, strokesMaxY);
      }

      // texts의 최대 Y 계산
      if (newTexts.length > 0) {
        const textsMaxY = Math.max(...newTexts.map((text) => text.y));
        maxYValue = Math.max(maxYValue, textsMaxY);
      }

      if (maxYValue > 0) {
        maxY.current = maxYValue;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      } else {
        maxY.current = 0;
        canvasHeight.current = 800;
      }

      setTick((t) => t + 1);
    }, []);

    const addPoint = useCallback((x: number, y: number) => {
      currentPoints.current.push({ x, y });
      // 최대 Y 좌표 업데이트
      if (y > maxY.current) {
        maxY.current = y;
        // 여유 공간을 위해 200px 추가
        canvasHeight.current = Math.max(800, maxY.current + 200);
        setTick((t) => t + 1);
      }
      // 경로는 매번 재생성하되, 렌더링은 최적화
      livePath.current = buildSmoothPath(currentPoints.current);
      setTick((t) => t + 1);
    }, []);

    const startStroke = useCallback((x: number, y: number) => {
      currentPoints.current = [{ x, y }];
      livePath.current = buildSmoothPath(currentPoints.current);
      setTick((t) => t + 1);
    }, []);

    const finalizeStroke = useCallback(() => {
      if (currentPoints.current.length === 0) {
        livePath.current = Skia.Path.Make();
        setTick((t) => t + 1);
        return;
      }

      const pointsToFinalize = [...currentPoints.current];
      // 최대 Y 좌표 업데이트
      const strokeMaxY = Math.max(...pointsToFinalize.map((p) => p.y));
      if (strokeMaxY > maxY.current) {
        maxY.current = strokeMaxY;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      }

      const newPath = buildSmoothPath(pointsToFinalize);
      const strokeData: Stroke = {
        points: pointsToFinalize,
        color: strokeColor,
        width: strokeWidth,
      };

      // 배치 업데이트: paths와 strokes를 함께 업데이트
      setStrokes((prev) => {
        const next = [...prev, strokeData];
        setPaths((prevPaths) => [...prevPaths, newPath]);
        strokesRef.current = next;
        onChange?.(next);
        setTick((t) => t + 1);

        // 히스토리에 저장
        setTimeout(() => saveToHistory(), 0);

        return next;
      });

      currentPoints.current = [];
      livePath.current = Skia.Path.Make();
    }, [strokeColor, strokeWidth, onChange, saveToHistory]);

    // 지우개: 터치한 위치에서 가까운 점들을 제거
    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        // Throttle: 너무 자주 호출되지 않도록 제한
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) {
          return;
        }
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize; // 제곱 비교로 sqrt 제거

        setStrokes((prevStrokes) => {
          // 1. 지울 선들을 걸러냅니다. (선 위의 점 중 하나라도 지우개 반경에 닿으면 삭제)
          const nextStrokes = prevStrokes.filter((stroke) => {
            // 최적화: 제곱 거리 비교 (sqrt 제거)
            const isTouched = stroke.points.some((point) => {
              const dx = point.x - x;
              const dy = point.y - y;
              const distanceSquared = dx * dx + dy * dy;
              return distanceSquared < thresholdSquared;
            });
            return !isTouched; // 닿지 않은 선들만 남김
          });

          // 2. 만약 지워진 선이 있다면 Path 배열도 업데이트
          if (nextStrokes.length !== prevStrokes.length) {
            // 경로를 한 번에 생성
            const newPaths = nextStrokes.map((s) => buildSmoothPath(s.points));
            setPaths(newPaths);
            strokesRef.current = nextStrokes;
            onChange?.(nextStrokes);
            setTick((t) => t + 1);

            // 히스토리에 저장 (지우개 동작)
            setTimeout(() => saveToHistory(), 0);

            return nextStrokes;
          }

          return prevStrokes;
        });
      },
      [eraserSize, onChange, saveToHistory]
    );

    const addEraserPoint = useCallback(
      (x: number, y: number) => {
        eraserPoints.current.push({ x, y });
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const startEraser = useCallback(
      (x: number, y: number) => {
        eraserPoints.current = [{ x, y }];
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const finalizeEraser = useCallback(() => {
      eraserPoints.current = [];
    }, []);

    const deleteText = useCallback((textId: string) => {
      setTexts((prev) => {
        const next = prev.filter((t) => t.id !== textId);
        textsRef.current = next;
        return next;
      });
      setTick((t) => t + 1);
    }, []);

    // 텍스트 영역과 충돌하는지 확인 (16px 여백 포함)
    const isNearExistingText = useCallback(
      (x: number, y: number): boolean => {
        const safeDistance = 16;
        const buttonSize = 20;

        for (const textItem of texts) {
          // 텍스트 너비 추정
          const estimatedCharWidth = textFontSize * 0.6;
          const textWidth = textItem.text.length * estimatedCharWidth;
          const textHeight = textFontSize;

          // 텍스트 영역 (16px 여백 포함)
          const textLeft = textItem.x - safeDistance;
          const textRight = textItem.x + textWidth + safeDistance + buttonSize + 4; // X 버튼 포함
          const textTop = textItem.y - textHeight - safeDistance;
          const textBottom = textItem.y + safeDistance;

          // 클릭한 위치가 텍스트 영역 내에 있는지 확인
          if (x >= textLeft && x <= textRight && y >= textTop && y <= textBottom) {
            return true;
          }
        }
        return false;
      },
      [texts, textFontSize]
    );

    // 텍스트 박스 영역과 겹치는 strokes를 밀어내기 (stroke 전체를 이동하여 모양 유지)
    const pushStrokesAwayFromTextArea = useCallback(
      (textX: number, textY: number, textHeight: number) => {
        const padding = 16;
        const textTop = textY - textHeight - padding;
        const textBottom = textY + padding;

        setStrokes((prevStrokes) => {
          let hasChanges = false;
          const updatedStrokes = prevStrokes.map((stroke) => {
            // stroke의 최소/최대 Y 좌표 계산
            const strokeMinY = Math.min(...stroke.points.map((p) => p.y));
            const strokeMaxY = Math.max(...stroke.points.map((p) => p.y));

            // stroke가 텍스트 박스 영역과 겹치는지 확인
            const overlapsTop = strokeMaxY >= textTop && strokeMaxY <= textBottom;
            const overlapsBottom = strokeMinY >= textTop && strokeMinY <= textBottom;
            const overlapsMiddle = strokeMinY <= textTop && strokeMaxY >= textBottom;

            if (overlapsTop || overlapsBottom || overlapsMiddle) {
              hasChanges = true;

              // stroke의 중심 Y 좌표 계산
              const strokeCenterY = (strokeMinY + strokeMaxY) / 2;

              // 이동 거리 계산
              let offsetY = 0;
              if (strokeCenterY < textY) {
                // 텍스트 박스 위쪽에 있으면 위로 이동
                offsetY = textTop - strokeMaxY - 1;
              } else {
                // 텍스트 박스 아래쪽에 있으면 아래로 이동
                offsetY = textBottom - strokeMinY + 1;
              }

              // stroke의 모든 점을 동일한 거리만큼 이동 (모양 유지)
              const updatedPoints = stroke.points.map((point) => ({
                ...point,
                y: point.y + offsetY,
              }));

              return { ...stroke, points: updatedPoints };
            }
            return stroke;
          });

          if (hasChanges) {
            // paths 재생성
            const newPaths = updatedStrokes.map((stroke) => buildSmoothPath(stroke.points));
            setPaths(newPaths);
            strokesRef.current = updatedStrokes;
            onChange?.(updatedStrokes);
            setTick((t) => t + 1);

            // 히스토리에 저장 (strokes 이동)
            setTimeout(() => saveToHistory(), 0);
          }

          return hasChanges ? updatedStrokes : prevStrokes;
        });
      },
      [onChange, saveToHistory]
    );

    const addText = useCallback(
      (x: number, y: number) => {
        // 기존 텍스트 주변 16px 내에서는 새 텍스트 박스 생성 안 함
        if (isNearExistingText(x, y)) {
          return;
        }

        // 상하 16px 여백 고려
        const padding = 16;
        const adjustedY = Math.max(
          padding,
          Math.min(y, (containerLayout.current?.height || 400) - padding)
        );

        // 텍스트 박스 영역과 겹치는 strokes를 밀어내기
        pushStrokesAwayFromTextArea(x, adjustedY, textFontSize);

        const textId = Date.now().toString();
        setActiveTextInput({
          id: textId,
          x: x,
          y: adjustedY,
          value: '',
        });

        // TextInput 포커스 및 키보드 처리
        setTimeout(() => {
          textInputRef.current?.focus();

          // 키보드가 올라올 때 텍스트 입력 위치로 스크롤
          const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
              keyboardHeight.current = e.endCoordinates.height;

              // 약간의 지연 후 스크롤 (레이아웃 업데이트 대기)
              setTimeout(() => {
                if (!containerLayout.current) return;

                // 텍스트 입력 위치 계산 (ScrollView 내부 기준)
                const textInputY = adjustedY;
                const screenHeight = Dimensions.get('window').height;
                const keyboardTop = screenHeight - e.endCoordinates.height;

                // 컨테이너의 절대 위치 계산
                const containerY = containerLayout.current.y;
                const textInputAbsoluteY = containerY + textInputY;
                const textInputBottom = textInputAbsoluteY + textFontSize + 40; // 텍스트 높이 + 여백

                // 키보드가 텍스트 입력을 가릴 수 있는지 확인
                if (textInputBottom > keyboardTop) {
                  // 스크롤할 거리 계산 (키보드 위로 여유 공간 확보)
                  const scrollOffset = textInputBottom - keyboardTop + 20;

                  // ScrollView를 스크롤
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, scrollOffset),
                    animated: true,
                  });
                }
              }, 100);
            }
          );

          // 키보드가 내려갈 때 리스너 제거
          const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
              keyboardHeight.current = 0;
              showListener.remove();
              hideListener.remove();
            }
          );
        }, 100);
      },
      [isNearExistingText, pushStrokesAwayFromTextArea, textFontSize]
    );

    const confirmTextInput = useCallback(() => {
      if (activeTextInput && activeTextInput.value.trim()) {
        const newText: TextItem = {
          id: activeTextInput.id,
          text: activeTextInput.value,
          x: activeTextInput.x,
          y: activeTextInput.y,
          fontSize: textFontSize,
          color: strokeColor,
        };
        // 최대 Y 좌표 업데이트
        if (activeTextInput.y > maxY.current) {
          maxY.current = activeTextInput.y;
          canvasHeight.current = Math.max(800, maxY.current + 200);
        }
        setTexts((prev) => {
          const next = [...prev, newText];
          textsRef.current = next;

          // 히스토리에 저장 (텍스트 추가)
          setTimeout(() => saveToHistory(), 0);

          return next;
        });
        setTick((t) => t + 1);
      }
      setActiveTextInput(null);
    }, [activeTextInput, textFontSize, strokeColor, saveToHistory]);

    const handleTextInputBlur = useCallback(() => {
      if (activeTextInput) {
        confirmTextInput();
      }
    }, [activeTextInput, confirmTextInput]);

    const handleTextInputChange = useCallback(
      (text: string) => {
        if (activeTextInput) {
          setActiveTextInput((prev) => (prev ? { ...prev, value: text } : null));
        }
      },
      [activeTextInput]
    );

    const undo = useCallback(() => {
      // 활성 텍스트 입력이 있으면 먼저 취소
      if (activeTextInput) {
        setActiveTextInput(null);
        return;
      }

      // 히스토리에서 이전 상태로 복원
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--;
        restoreFromHistory(historyIndexRef.current);
      } else if (historyIndexRef.current === 0) {
        // 첫 번째 상태로 복원 (빈 상태)
        historyIndexRef.current = -1;
        restoreFromHistory(0);
      }
      // historyIndexRef.current === -1이면 undo할 히스토리가 없음
    }, [activeTextInput, restoreFromHistory]);

    const redo = useCallback(() => {
      // 활성 텍스트 입력이 있으면 redo 불가
      if (activeTextInput) {
        return;
      }

      // 히스토리에서 다음 상태로 복원
      const nextIndex = historyIndexRef.current + 1;
      if (nextIndex < historyRef.current.length) {
        historyIndexRef.current = nextIndex;
        restoreFromHistory(nextIndex);
      }
      // nextIndex >= historyRef.current.length이면 redo할 히스토리가 없음
    }, [activeTextInput, restoreFromHistory]);

    // 초기 상태를 히스토리에 저장
    useEffect(() => {
      if (historyRef.current.length === 0) {
        const initialState: HistoryState = {
          strokes: [],
          texts: [],
        };
        historyRef.current = [initialState];
        historyIndexRef.current = 0;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        setTexts([]);
        setActiveTextInput(null);
        strokesRef.current = [];
        textsRef.current = [];
        livePath.current = Skia.Path.Make();
        maxY.current = 0;
        canvasHeight.current = 800;
        setTick((t) => t + 1);
        onChange?.([]);

        // 히스토리 초기화
        historyRef.current = [];
        historyIndexRef.current = -1;
      },
      undo,
      redo,
      canUndo: () => {
        // 활성 텍스트 입력이 있으면 undo 가능
        if (activeTextInput) return true;
        // 히스토리 인덱스가 0보다 크면 undo 가능 (이전 상태가 있음)
        if (historyIndexRef.current > 0) return true;
        // 초기 상태만 있고 실제 변경이 없으면 undo 불가능
        // 히스토리가 1개만 있으면 (초기 상태만) undo 불가능
        if (historyRef.current.length === 1) return false;
        // 히스토리가 2개 이상이면 undo 가능
        return historyIndexRef.current === 0 && historyRef.current.length > 1;
      },
      canRedo: () => {
        // 활성 텍스트 입력이 있으면 redo 불가
        if (activeTextInput) return false;
        // 다음 히스토리가 있으면 redo 가능
        return historyIndexRef.current + 1 < historyRef.current.length;
      },
      getStrokes: () => strokesRef.current,
      setStrokes: loadStrokes,
      getTexts: () => textsRef.current,
      setTexts: loadTexts,
    }));

    const tap = useMemo(
      () =>
        Gesture.Tap().onEnd((e) => {
          'worklet';
          // 텍스트 입력은 손가락도 허용 (모든 입력 타입 허용)
          if (textMode && !eraserMode) {
            runOnJS(addText)(e.x, e.y);
          }
        }),
      [textMode, eraserMode, addText]
    );

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .minPointers(1)
          .maxPointers(1) // 한 손가락만 허용 (두 손가락은 스크롤)
          .onBegin((e) => {
            'worklet';
            // 펜슬만 허용 (제스처 이벤트에서 직접 pointerType 확인)
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            showHover.value = false; // 그리기 시작 시 호버 숨김
            if (textMode) return; // 텍스트 모드에서는 그리기 비활성화
            if (eraserMode) {
              runOnJS(startEraser)(e.x, e.y);
            } else {
              runOnJS(startStroke)(e.x, e.y);
            }
          })
          .onUpdate((e) => {
            'worklet';
            // 펜슬만 허용 (제스처 이벤트에서 직접 pointerType 확인)
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            if (textMode) return;
            if (eraserMode) {
              runOnJS(addEraserPoint)(e.x, e.y);
            } else {
              runOnJS(addPoint)(e.x, e.y);
            }
          })
          .onEnd(() => {
            'worklet';
            if (textMode) return;
            if (eraserMode) {
              runOnJS(finalizeEraser)();
            } else {
              runOnJS(finalizeStroke)();
            }
          })
          .minDistance(1),
      [
        textMode,
        eraserMode,
        startStroke,
        addPoint,
        finalizeStroke,
        startEraser,
        addEraserPoint,
        finalizeEraser,
      ]
    );

    // 호버 제스처 (펜슬/마우스에서만 작동)
    const hoverGesture = useMemo(
      () =>
        Gesture.Hover()
          .onBegin((e) => {
            'worklet';
            // 펜슬/마우스에서만 호버 표시
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            }
          })
          .onUpdate((e) => {
            'worklet';
            // 펜슬/마우스에서만 호버 표시
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            } else {
              showHover.value = false;
            }
          })
          .onEnd(() => {
            'worklet';
            showHover.value = false;
          })
          .onFinalize(() => {
            'worklet';
            showHover.value = false;
          }),
      []
    );

    // 호버 opacity를 위한 derived value
    const hoverOpacity = useDerivedValue(() => {
      return showHover.value ? 0.6 : 0;
    }, [showHover]);

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(Gesture.Race(tap, pan), hoverGesture),
      [tap, pan, hoverGesture]
    );

    // 경로 렌더링 최적화: paths 배열이 변경될 때만 재렌더링
    // 각 stroke는 저장된 width와 color를 사용
    const renderedPaths = useMemo(
      () =>
        paths.map((p, i) => {
          const stroke = strokes[i];
          return (
            <Path
              key={`path-${i}-${paths.length}`}
              path={p}
              style='stroke'
              strokeWidth={stroke?.width || strokeWidth}
              color={stroke?.color || strokeColor}
              strokeCap='round'
              strokeJoin='round'
            />
          );
        }),
      [paths, strokes, strokeWidth, strokeColor]
    );

    // 텍스트 렌더링 최적화
    const renderedTexts = useMemo(
      () =>
        font
          ? texts.map((textItem) => (
              <Text
                key={textItem.id}
                x={textItem.x}
                y={textItem.y}
                text={textItem.text}
                font={font}
                color={textItem.color}
              />
            ))
          : null,
      [texts, font]
    );

    // 텍스트 삭제 버튼 렌더링 (텍스트 모드일 때만)
    const renderedTextDeleteButtons = useMemo(() => {
      if (!textMode || eraserMode) return null;

      return texts.map((textItem) => {
        // 텍스트 너비 추정
        const estimatedCharWidth = textFontSize * 0.8;
        const textWidth = textItem.text.length * estimatedCharWidth;
        const buttonSize = 20;
        const buttonX = textItem.x + textWidth + 4;
        const buttonY = textItem.y - textFontSize + (textFontSize - buttonSize) / 2;

        return (
          <Pressable
            key={`delete-${textItem.id}`}
            style={[
              styles.deleteButton,
              {
                left: buttonX,
                top: buttonY,
                width: buttonSize,
                height: buttonSize,
              },
            ]}
            onPress={() => deleteText(textItem.id)}>
            <RNText style={styles.deleteButtonText}>×</RNText>
          </Pressable>
        );
      });
    }, [texts, textMode, eraserMode, textFontSize, deleteText]);

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps='handled'>
        <GestureDetector gesture={composedGesture}>
          <View
            style={styles.container}
            collapsable={false}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              containerLayout.current = { x, y, width, height };
            }}>
            <Canvas style={[styles.canvas, { height: canvasHeight.current }]}>
              {renderedPaths}
              {currentPoints.current.length > 0 && (
                <Path
                  path={livePath.current}
                  style='stroke'
                  strokeWidth={strokeWidth}
                  color={strokeColor}
                  strokeCap='round'
                  strokeJoin='round'
                />
              )}
              {renderedTexts}

              <Group>
                <Circle
                  cx={hoverX}
                  cy={hoverY}
                  r={eraserMode ? eraserSize : strokeWidth / 2}
                  color={eraserMode ? '#e2e2e2' : strokeColor}
                  opacity={hoverOpacity}
                  style='stroke'
                  strokeWidth={1.5}
                />
              </Group>
            </Canvas>

            {/* 인라인 텍스트 입력 박스 */}
            {activeTextInput && (
              <View
                style={[
                  styles.textInputWrapper,
                  {
                    left: Math.max(
                      0,
                      Math.min(activeTextInput.x, (containerLayout.current?.width || 400) - 200)
                    ),
                    top: Math.max(
                      16,
                      Math.min(
                        activeTextInput.y - textFontSize,
                        (containerLayout.current?.height || 400) - 16 - textFontSize
                      )
                    ),
                  },
                ]}>
                <TextInput
                  ref={textInputRef}
                  style={[
                    styles.inlineTextInput,
                    {
                      fontSize: textFontSize,
                      color: strokeColor,
                    },
                  ]}
                  value={activeTextInput.value}
                  onChangeText={handleTextInputChange}
                  placeholder='텍스트 입력'
                  placeholderTextColor='#9CA3AF'
                  multiline
                  autoFocus
                  onBlur={handleTextInputBlur}
                  blurOnSubmit={false}
                />
              </View>
            )}

            {/* 텍스트 삭제 버튼 */}
            {renderedTextDeleteButtons}
          </View>
        </GestureDetector>
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { minHeight: 400, position: 'relative' },
  canvas: { width: '100%', backgroundColor: 'white' },
  textInputWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    minWidth: 200,
    maxWidth: Dimensions.get('window').width * 0.4 - 40,
  },
  inlineTextInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    width: '100%',
  },
  deleteButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export default React.memo(DrawingCanvas);
