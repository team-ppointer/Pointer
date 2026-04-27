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
import { Path, type SkPath, Skia, useFont, Circle, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { buildSmoothPath } from './smoothing';
import {
  type DrawingCanvasProps,
  type DrawingCanvasRef,
  type DocumentSnapshot,
  type Point,
  type Stroke,
  type TextItem,
} from './model/drawingTypes';
import { deepCopyTexts, safeMax, computeStrokeBounds } from './model/strokeUtils';
import { HistoryManager } from './engine/HistoryManager';
import { wrapTextToLines } from './render/skia/skiaRenderUtils';
import { useSkiaDrawingRenderer } from './render/skia/useSkiaDrawingRenderer';
import { SkiaDrawingCanvasSurface } from './render/skia/SkiaDrawingCanvasSurface';

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  eraserMode?: boolean;
  eraserSize?: number;
  textMode?: boolean;
  textFontPath?: number; // Skia에서 사용할 폰트 파일 경로 (require로 전달)
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
  (
    {
      strokeColor = 'black',
      strokeWidth = 3,
      onChange,
      onHistoryChange,
      eraserMode = false,
      eraserSize = 20,
      textMode = false,
      textFontPath,
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
    const isConfirmingTextRef = useRef<boolean>(false); // 텍스트 확인 중 플래그
    const keyboardListenersRef = useRef<{ remove: () => void }[]>([]);

    // 호버 좌표를 저장할 SharedValue (성능을 위해 스레드 분리)
    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);
    const isActiveGesture = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const textsRef = useRef<TextItem[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const eraserDidModify = useRef<boolean>(false);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 히스토리 관리 — command pattern
    const historyManager = useRef(new HistoryManager(50)).current;

    const notifyHistoryChange = useCallback(() => {
      if (!onHistoryChange) return;
      const canUndo = activeTextInput !== null || historyManager.canUndo();
      const canRedo = activeTextInput === null && historyManager.canRedo();
      onHistoryChange(canUndo, canRedo);
    }, [onHistoryChange, activeTextInput, historyManager]);

    useEffect(() => {
      historyManager.setListener(onHistoryChange ? () => notifyHistoryChange() : null);
    }, [historyManager, onHistoryChange, notifyHistoryChange]);

    /** 현재 stroke 상태의 경량 스냅샷 (reference 저장, deep copy 아님) */
    const createSnapshot = useCallback((): DocumentSnapshot => ({
      strokes: strokesRef.current,
      bounds: strokesRef.current.map((s) => computeStrokeBounds(s.points)),
    }), []);

    /** 스냅샷을 React 상태에 반영 + 선택적 텍스트 복원 */
    const applySnapshot = useCallback(
      (snapshot: DocumentSnapshot, newTexts?: readonly TextItem[]) => {
        const restoredStrokes = [...snapshot.strokes];
        const newPaths = restoredStrokes.map((stroke) => buildSmoothPath(stroke.points));

        setStrokes(restoredStrokes);
        setPaths(newPaths);
        strokesRef.current = restoredStrokes;

        if (newTexts) {
          const restoredTexts = [...newTexts];
          setTexts(restoredTexts);
          textsRef.current = restoredTexts;
        }

        // 최대 Y 좌표 재계산
        let maxYValue = 0;
        if (snapshot.strokes.length > 0) {
          const strokesMaxY = safeMax(
            snapshot.strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxYValue = Math.max(maxYValue, strokesMaxY);
        }
        const currentTexts = newTexts ?? textsRef.current;
        if (currentTexts.length > 0) {
          const textsMaxY = safeMax(currentTexts.map((text) => text.y));
          maxYValue = Math.max(maxYValue, textsMaxY);
        }

        if (maxYValue > 0) {
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxY.current + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(restoredStrokes);
      },
      [onChange]
    );

    // 폰트 로드 (Skia Text용) - 고정 15px
    const font = useFont(textFontPath, 15);

    // 실제 컨테이너 너비 상태 관리 (onLayout으로 측정)
    const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);

    // 화면 너비에서 패딩을 뺀 최대 너비 계산
    const maxTextWidth = useMemo(() => {
      return containerWidth - 40; // 좌우 패딩 20px씩
    }, [containerWidth]);

    // 텍스트의 실제 줄 수 계산 (자동 줄바꿈 포함) - wrapTextToLines로 중복 제거
    const textLineCountCache = useRef<Map<string, number>>(new Map());

    const calculateTextLineCount = useCallback(
      (text: string): number => {
        if (!font) return 1;

        const cacheKey = `${text}-${maxTextWidth}`;
        if (textLineCountCache.current.has(cacheKey)) {
          return textLineCountCache.current.get(cacheKey) ?? 1;
        }

        const lineCount = wrapTextToLines(text, maxTextWidth, (t) => font.measureText(t)).length;

        // 캐시 저장 (최대 100개 항목만 유지)
        if (textLineCountCache.current.size > 100) {
          const firstKey = textLineCountCache.current.keys().next().value;
          if (firstKey) {
            textLineCountCache.current.delete(firstKey);
          }
        }
        textLineCountCache.current.set(cacheKey, lineCount);

        return lineCount;
      },
      [font, maxTextWidth]
    );

    const loadStrokes = useCallback(
      (newStrokes: Stroke[]) => {
        // strokes와 paths를 함께 업데이트
        const newPaths = newStrokes.map((stroke) => buildSmoothPath(stroke.points));
        setStrokes(newStrokes);
        setPaths(newPaths);
        strokesRef.current = newStrokes;

        // 최대 Y 좌표 계산
        if (newStrokes.length > 0) {
          const maxYValue = safeMax(newStrokes.flatMap((stroke) => stroke.points.map((p) => p.y)));
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxYValue + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        // 상태 변경으로 자동 리렌더링
        onChange?.(newStrokes);

        // 히스토리 초기화 (외부에서 로드한 경우)
        historyManager.clear();
      },
      [onChange, historyManager]
    );

    const loadTexts = useCallback((newTexts: TextItem[]) => {
      setTexts(newTexts);
      textsRef.current = newTexts;

      // 최대 Y 좌표 계산 (strokes와 texts 모두 고려)
      let maxYValue = 0;

      // strokes의 최대 Y 계산
      if (strokesRef.current.length > 0) {
        const strokesMaxY = safeMax(
          strokesRef.current.flatMap((stroke) => stroke.points.map((p) => p.y))
        );
        maxYValue = Math.max(maxYValue, strokesMaxY);
      }

      // texts의 최대 Y 계산
      if (newTexts.length > 0) {
        const textsMaxY = safeMax(newTexts.map((text) => text.y));
        maxYValue = Math.max(maxYValue, textsMaxY);
      }

      if (maxYValue > 0) {
        maxY.current = maxYValue;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      } else {
        maxY.current = 0;
        canvasHeight.current = 800;
      }

      // 상태 변경으로 자동 리렌더링
    }, []);

    // 텍스트 영역과 충돌하는지 확인 (32px 여백 포함, 캔버스 전체 너비, 멀티라인 고려)
    const isNearExistingText = useCallback(
      (y: number): boolean => {
        const safeDistance = 32; // 텍스트 주변 32px 보호 영역

        for (const textItem of texts) {
          // 실제 줄 수 계산
          const lineCount = calculateTextLineCount(textItem.text);
          const totalTextHeight = lineCount * 22.5; // 고정 줄 높이

          // 텍스트 영역의 Y 범위 (32px 여백 포함, X는 캔버스 전체 너비)
          const textTop = textItem.y - safeDistance;
          const textBottom = textItem.y + totalTextHeight + safeDistance;

          // Y 좌표가 텍스트 영역 내에 있으면 캔버스 전체 너비에서 필기 차단
          if (y >= textTop && y <= textBottom) {
            return true;
          }
        }
        return false;
      },
      [texts, calculateTextLineCount]
    );

    const addPoint = useCallback(
      (x: number, y: number) => {
        // 텍스트 영역에서는 필기 차단
        if (isNearExistingText(y)) {
          return;
        }

        currentPoints.current.push({ x, y });
        // 경로는 매번 재생성
        livePath.current = buildSmoothPath(currentPoints.current);

        // 최대 Y 좌표 업데이트 시에만 리렌더링
        if (y > maxY.current) {
          maxY.current = y;
          canvasHeight.current = Math.max(800, maxY.current + 200);
          setTick((t) => t + 1);
        } else {
          // 일반적인 경우에도 livePath가 변경되었으므로 리렌더링 필요
          setTick((t) => t + 1);
        }
      },
      [isNearExistingText]
    );

    const startStroke = useCallback(
      (x: number, y: number) => {
        // 텍스트 영역에서는 필기 시작 차단
        if (isNearExistingText(y)) {
          return;
        }

        currentPoints.current = [{ x, y }];
        livePath.current = buildSmoothPath(currentPoints.current);
        setTick((t) => t + 1);
      },
      [isNearExistingText]
    );

    const finalizeStroke = useCallback(() => {
      if (currentPoints.current.length === 0) {
        livePath.current.reset();
        setTick((t) => t + 1);
        return;
      }

      const snapshotBefore = createSnapshot();

      const pointsToFinalize = [...currentPoints.current];
      // 최대 Y 좌표 업데이트
      const strokeMaxY = safeMax(pointsToFinalize.map((p) => p.y));
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
      const bounds = computeStrokeBounds(strokeData.points);
      const nextStrokes = [...strokesRef.current, strokeData];

      strokesRef.current = nextStrokes;
      setStrokes(nextStrokes);
      setPaths((prev) => [...prev, newPath]);

      currentPoints.current = [];
      livePath.current.reset();

      onChange?.(nextStrokes);
      historyManager.push({
        type: 'append-stroke',
        stroke: strokeData,
        bounds,
        snapshotBefore,
      });
    }, [strokeColor, strokeWidth, onChange, createSnapshot, historyManager]);

    // 지우개: 터치한 위치에서 가까운 점들을 제거
    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) return;
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize;
        const prevStrokes = strokesRef.current;
        const nextStrokes = prevStrokes.filter((stroke) => {
          const isTouched = stroke.points.some((point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            return dx * dx + dy * dy < thresholdSquared;
          });
          return !isTouched;
        });

        if (nextStrokes.length !== prevStrokes.length) {
          const newPaths = nextStrokes.map((s) => buildSmoothPath(s.points));
          setStrokes(nextStrokes);
          setPaths(newPaths);
          strokesRef.current = nextStrokes;
          onChange?.(nextStrokes);
          eraserDidModify.current = true;
        }
      },
      [eraserSize, onChange]
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
        historyManager.beginTransaction(createSnapshot());
        eraseAtPoint(x, y);
      },
      [eraseAtPoint, createSnapshot, historyManager]
    );

    const finalizeEraser = useCallback(() => {
      eraserPoints.current = [];
      if (eraserDidModify.current) {
        historyManager.commitTransaction(createSnapshot());
        eraserDidModify.current = false;
      } else {
        historyManager.discardTransaction();
      }
    }, [createSnapshot, historyManager]);

    const deleteText = useCallback((textId: string) => {
      setTexts((prev) => {
        const next = prev.filter((t) => t.id !== textId);
        textsRef.current = next;
        return next;
      });
      // 상태 변경으로 자동 리렌더링
    }, []);

    const cleanupKeyboardListeners = useCallback(() => {
      keyboardListenersRef.current.forEach((l) => l.remove());
      keyboardListenersRef.current = [];
    }, []);

    const scrollToTextInput = useCallback(
      (textInputY: number, textHeight: number) => {
        setTimeout(() => {
          textInputRef.current?.focus();

          // 기존 리스너 정리 (중복 등록 방지)
          cleanupKeyboardListeners();

          const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
              keyboardHeight.current = e.endCoordinates.height;
              setTimeout(() => {
                if (!containerLayout.current) return;
                const screenHeight = Dimensions.get('window').height;
                const keyboardTop = screenHeight - e.endCoordinates.height;
                const containerY = containerLayout.current.y;
                const textInputAbsoluteY = containerY + textInputY;
                const textInputBottom = textInputAbsoluteY + textHeight + 40;
                if (textInputBottom > keyboardTop) {
                  const scrollOffset = textInputBottom - keyboardTop + 20;
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, scrollOffset),
                    animated: true,
                  });
                }
              }, 100);
            }
          );

          const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
              keyboardHeight.current = 0;
              cleanupKeyboardListeners();
            }
          );

          keyboardListenersRef.current = [showListener, hideListener];
        }, 100);
      },
      [cleanupKeyboardListeners]
    );

    const addText = useCallback(
      (x: number, y: number) => {
        // activeTextInput이 이미 있으면 새로운 텍스트 입력 생성하지 않음 (onBlur 처리 중일 수 있음)
        if (activeTextInput || isConfirmingTextRef.current) {
          return;
        }

        // 삭제 버튼 영역 확인 (각 텍스트의 삭제 버튼 위치)
        const buttonSize = 20;
        for (const textItem of texts) {
          const buttonX = textItem.x - buttonSize + 10;
          const buttonY = textItem.y + (15 - buttonSize) / 2 + 10;

          // 터치 위치가 삭제 버튼 영역 내에 있는지 확인
          if (
            x >= buttonX &&
            x <= buttonX + buttonSize &&
            y >= buttonY &&
            y <= buttonY + buttonSize
          ) {
            return; // 삭제 버튼 영역이면 텍스트 추가 안 함
          }
        }

        // 기존 텍스트 클릭 확인
        for (const textItem of texts) {
          const lineCount = calculateTextLineCount(textItem.text);
          const totalTextHeight = lineCount * 22.5; // 고정 줄 높이

          // 텍스트 영역 확인 (X 좌표는 캔버스 전체 너비, Y 좌표만 확인)
          const textTop = textItem.y;
          const textBottom = textItem.y + totalTextHeight;

          // Y 좌표가 텍스트 영역 내에 있으면 편집 모드로 전환
          if (y >= textTop && y <= textBottom) {
            setActiveTextInput({
              id: textItem.id,
              x: textItem.x,
              y: textItem.y,
              value: textItem.text,
            });

            scrollToTextInput(textItem.y, totalTextHeight);
            return;
          }
        }

        const padding = 16;
        const minGap = 32; // 필기 아래 32px

        // 가장 아래쪽 stroke 찾기
        let textY = padding; // 기본값: 캔버스 상단 16px

        if (strokes.length > 0) {
          // 모든 stroke의 최대 Y 좌표 찾기
          const maxStrokeY = safeMax(strokes.flatMap((stroke) => stroke.points.map((p) => p.y)));
          textY = maxStrokeY + minGap; // 가장 아래 필기 + 32px
        }

        // 기존 텍스트가 있으면 그 아래로 (멀티라인 고려)
        if (texts.length > 0) {
          const textBottoms = texts.map((text) => {
            const lineCount = calculateTextLineCount(text.text);
            const totalHeight = lineCount * 22.5; // 고정 줄 높이
            return text.y + totalHeight;
          });
          const maxTextBottom = safeMax(textBottoms);
          textY = Math.max(textY, maxTextBottom + minGap);
        }

        const textId = Date.now().toString();
        setActiveTextInput({
          id: textId,
          x: padding, // 항상 캔버스 왼쪽 끝(16px)에서 시작
          y: textY, // 가장 아래 필기/텍스트 아래 32px
          value: '',
        });

        scrollToTextInput(textY, 15);
      },
      [activeTextInput, scrollToTextInput, strokes, texts, calculateTextLineCount]
    );

    const confirmTextInput = useCallback(() => {
      // 이미 처리 중이면 중복 실행 방지
      if (isConfirmingTextRef.current) {
        return;
      }

      if (activeTextInput && activeTextInput.value.trim()) {
        isConfirmingTextRef.current = true;
        const currentTexts = textsRef.current;
        const snapshotBefore = createSnapshot();
        const textsBefore = [...currentTexts];

        // 기존 텍스트 수정인지 새 텍스트 추가인지 확인
        const existingTextIndex = currentTexts.findIndex((t) => t.id === activeTextInput.id);

        // 텍스트의 실제 줄 수 계산하여 최대 Y 좌표 업데이트
        const lineCount = calculateTextLineCount(activeTextInput.value);
        const totalTextHeight = lineCount * 22.5;
        const textBottomY = activeTextInput.y + totalTextHeight;
        let nextTexts: TextItem[];

        if (existingTextIndex >= 0) {
          // 기존 텍스트 수정
          nextTexts = currentTexts.map((text) =>
            text.id === activeTextInput.id
              ? {
                  ...text,
                  text: activeTextInput.value,
                }
              : text
          );
        } else {
          // 새 텍스트 추가
          const newText: TextItem = {
            id: activeTextInput.id,
            text: activeTextInput.value,
            x: activeTextInput.x,
            y: activeTextInput.y,
            fontSize: 15, // 고정 폰트 크기
            color: '#1E1E21', // 고정 텍스트 색상
          };

          nextTexts = [...currentTexts, newText];
        }

        textsRef.current = nextTexts;
        setTexts(nextTexts);

        // 사이드이펙트는 updater 외부에서 (가이드 수정 2 원칙)
        if (textBottomY > maxY.current) {
          maxY.current = textBottomY;
          canvasHeight.current = Math.max(800, maxY.current + 200);
          setTick((t) => t + 1);
        }

        historyManager.push({
          type: 'replace-document',
          snapshotBefore,
          snapshotAfter: createSnapshot(),
          textsBefore,
          textsAfter: [...nextTexts],
        });
      }

      // activeTextInput을 먼저 null로 설정하여 중복 실행 방지
      setActiveTextInput(null);

      // 플래그 리셋
      isConfirmingTextRef.current = false;
    }, [activeTextInput, createSnapshot, historyManager, calculateTextLineCount]);

    const handleTextInputBlur = useCallback(() => {
      // 이미 처리 중이거나 activeTextInput이 없으면 실행하지 않음
      if (isConfirmingTextRef.current || !activeTextInput) {
        return;
      }
      confirmTextInput();
    }, [activeTextInput, confirmTextInput]);

    const handleTextInputChange = useCallback(
      (text: string) => {
        if (activeTextInput) {
          setActiveTextInput((prev) => (prev ? { ...prev, value: text } : null));

          // 입력 중에도 캔버스 높이 동적 확장
          if (text.trim()) {
            const lineCount = calculateTextLineCount(text);
            const totalTextHeight = lineCount * 22.5; // 고정 줄 높이 22.5px
            const textBottomY = activeTextInput.y + totalTextHeight;

            if (textBottomY > maxY.current) {
              maxY.current = textBottomY;
              canvasHeight.current = Math.max(800, maxY.current + 200);
              setTick((t) => t + 1); // 캔버스 높이 변경을 위한 리렌더링
            }
          }
        }
      },
      [activeTextInput, calculateTextLineCount]
    );

    const undo = useCallback(() => {
      if (activeTextInput) {
        setActiveTextInput(null);
        return;
      }

      const entry = historyManager.undo();
      if (!entry) return;

      switch (entry.type) {
        case 'append-stroke': {
          // O(1): 마지막 stroke/path만 제거
          const nextStrokes = strokesRef.current.slice(0, -1);
          strokesRef.current = nextStrokes;
          setStrokes(nextStrokes);
          setPaths((prev) => prev.slice(0, -1));
          onChange?.(nextStrokes);
          break;
        }
        case 'erase-strokes': {
          applySnapshot(entry.snapshotBefore);
          break;
        }
        case 'replace-document': {
          // 텍스트 변경 undo — 새로 추가된 텍스트는 편집 모드로 되돌림
          const prevTextIds = new Set(entry.textsBefore.map((t) => t.id));
          const newlyAdded = entry.textsAfter.find((t) => !prevTextIds.has(t.id));

          applySnapshot(entry.snapshotBefore, entry.textsBefore);

          if (newlyAdded) {
            setActiveTextInput({
              id: newlyAdded.id,
              x: newlyAdded.x,
              y: newlyAdded.y,
              value: newlyAdded.text,
            });
            setTimeout(() => {
              textInputRef.current?.focus();
            }, 100);
          }
          break;
        }
      }
    }, [activeTextInput, historyManager, applySnapshot, onChange]);

    const redo = useCallback(() => {
      if (activeTextInput) return;

      const entry = historyManager.redo();
      if (!entry) return;

      switch (entry.type) {
        case 'append-stroke': {
          // stroke + path 다시 추가
          const nextStrokes = [...strokesRef.current, entry.stroke];
          strokesRef.current = nextStrokes;
          setStrokes(nextStrokes);
          setPaths((prev) => [...prev, buildSmoothPath(entry.stroke.points)]);
          onChange?.(nextStrokes);
          break;
        }
        case 'erase-strokes': {
          applySnapshot(entry.snapshotAfter);
          break;
        }
        case 'replace-document': {
          applySnapshot(entry.snapshotAfter, entry.textsAfter);
          break;
        }
      }
    }, [activeTextInput, historyManager, applySnapshot, onChange]);

    // activeTextInput 상태 변경 시 히스토리 상태 알림
    useEffect(() => {
      notifyHistoryChange();
    }, [activeTextInput, notifyHistoryChange]);

    // unmount 시 키보드 리스너 정리
    useEffect(() => {
      return () => {
        cleanupKeyboardListeners();
      };
    }, [cleanupKeyboardListeners]);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        setTexts([]);
        setActiveTextInput(null);
        strokesRef.current = [];
        textsRef.current = [];
        livePath.current.reset();
        maxY.current = 0;
        canvasHeight.current = 800;
        onChange?.([]);

        historyManager.clear();
      },
      undo,
      redo,
      canUndo: () => activeTextInput !== null || historyManager.canUndo(),
      canRedo: () => activeTextInput === null && historyManager.canRedo(),
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
          // activeTextInput이 있으면 새로운 텍스트 입력 생성하지 않음 (onBlur 처리 중일 수 있음)
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
            isActiveGesture.value = true;
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
            if (!isActiveGesture.value) return;
            isActiveGesture.value = false;
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

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(Gesture.Race(tap, pan), hoverGesture),
      [tap, pan, hoverGesture]
    );

    const { renderedPaths, renderedTexts, hoverOpacity } = useSkiaDrawingRenderer({
      paths,
      strokes,
      strokeWidth,
      strokeColor,
      texts,
      font,
      maxTextWidth,
      activeTextInputId: activeTextInput?.id ?? null,
      showHover,
    });

    // 텍스트 삭제 버튼 렌더링 (텍스트 모드일 때만, 텍스트 시작 위치에 배치)
    const renderedTextDeleteButtons = useMemo(() => {
      if (!textMode || eraserMode) return null;

      return texts
        .filter((textItem) => {
          // activeTextInput이 있고 id가 일치하면 편집 중이므로 삭제 버튼도 표시하지 않음
          if (activeTextInput && activeTextInput.id === textItem.id) {
            return false;
          }
          return true;
        })
        .map((textItem) => {
          const buttonSize = 20;
          const buttonX = textItem.x - buttonSize + 10; // 텍스트 시작 왼쪽에 배치
          const buttonY = textItem.y + (15 - buttonSize) / 2 + 10;

          return (
            <Pressable
              key={`delete-${textItem.id}`}
              style={[
                styles.deleteButton,
                {
                  position: 'absolute',
                  left: buttonX,
                  top: buttonY,
                  width: buttonSize,
                  height: buttonSize,
                  zIndex: 100,
                },
              ]}
              onPress={() => deleteText(textItem.id)}>
              <RNText style={styles.deleteButtonText}>×</RNText>
            </Pressable>
          );
        });
    }, [texts, textMode, eraserMode, deleteText, activeTextInput]);

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
              // 실제 컨테이너 너비 업데이트
              setContainerWidth(width);
            }}>
            <SkiaDrawingCanvasSurface height={canvasHeight.current}>
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
            </SkiaDrawingCanvasSurface>

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
                        activeTextInput.y,
                        (containerLayout.current?.height || 400) - 16 - 15
                      )
                    ),
                    width: maxTextWidth, // 동적 너비 적용
                  },
                ]}>
                <TextInput
                  ref={textInputRef}
                  style={[
                    styles.inlineTextInput,
                    {
                      fontSize: 15, // 고정 폰트 크기
                      color: '#1E1E21', // 고정 텍스트 색상
                      width: maxTextWidth, // 동적 너비 적용
                      maxWidth: maxTextWidth, // 최대 너비 제한
                      fontFamily: 'Pretendard', // 고정 폰트
                      fontWeight: '400', // 고정 폰트 굵기 (Regular)
                      lineHeight: 22.5, // 고정 줄 높이 (15px의 150%)
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
                  scrollEnabled={false}
                  textBreakStrategy='simple'
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

DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { minHeight: 400, position: 'relative' },
  textInputWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    overflow: 'hidden', // 컨테이너 넘어가는 내용 숨김
    // width는 인라인 스타일로 동적 적용
  },
  inlineTextInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    textAlignVertical: 'top',
    flexWrap: 'wrap', // 텍스트 줄바꿈
    // width는 인라인 스타일로 동적 적용
  },
  deleteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export default React.memo(DrawingCanvas);
