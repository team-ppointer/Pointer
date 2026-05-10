import { useCallback, useEffect, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { type Corner, LONG_PRESS_MS, SCREEN_MARGIN, SPRING, TOOLBAR_H, cornerXY } from './shared';

interface UseFloatingToolbarSnapOptions {
  containerWidth: number;
  containerHeight: number;
  toolbarWidth: number;
  initialCorner?: Corner;
}

export function useFloatingToolbarSnap({
  containerWidth,
  containerHeight,
  toolbarWidth,
  initialCorner = 'bottom-left',
}: UseFloatingToolbarSnapOptions) {
  const [corner, setCorner] = useState<Corner>(initialCorner);
  const isFirstMount = useRef(true);

  const translateX = useSharedValue(SCREEN_MARGIN);
  const translateY = useSharedValue(SCREEN_MARGIN);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const dragged = useSharedValue(false);

  // 첫 measure 시 즉시 위치 (좌상단 → corner spring 비행 방지). 이후 corner / size 변경 시에만 spring.
  useEffect(() => {
    if (containerWidth <= 0 || containerHeight <= 0) return;
    const { x, y } = cornerXY(corner, toolbarWidth, containerWidth, containerHeight);
    if (isFirstMount.current) {
      translateX.value = x;
      translateY.value = y;
      isFirstMount.current = false;
    } else {
      translateX.value = withSpring(x, SPRING);
      translateY.value = withSpring(y, SPRING);
    }
  }, [corner, toolbarWidth, containerWidth, containerHeight, translateX, translateY]);

  const snapToCorner = useCallback(
    (x: number, y: number) => {
      if (containerWidth <= 0 || containerHeight <= 0) return;
      const cx = x + toolbarWidth / 2;
      const cy = y + TOOLBAR_H / 2;

      const inLeft = cx < containerWidth / 3;
      const inRight = cx > (containerWidth * 2) / 3;
      const inTop = cy < containerHeight / 3;
      const inBottom = cy > (containerHeight * 2) / 3;

      let next: Corner = corner;
      if ((inLeft || inRight) && (inTop || inBottom)) {
        const vertical = inTop ? 'top' : 'bottom';
        const horizontal = inLeft ? 'left' : 'right';
        next = `${vertical}-${horizontal}` as Corner;
      }

      if (next === corner) {
        // 같은 corner zone 으로 release: setCorner 가 effect 트리거 못 하므로 직접 spring 으로 복귀.
        const { x: tx, y: ty } = cornerXY(next, toolbarWidth, containerWidth, containerHeight);
        translateX.value = withSpring(tx, SPRING);
        translateY.value = withSpring(ty, SPRING);
      } else {
        // 다른 corner: setCorner 만 호출 → effect 가 spring 담당 (중복 spring 방지).
        setCorner(next);
      }
    },
    [containerWidth, containerHeight, toolbarWidth, corner, translateX, translateY]
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .onBegin(() => {
      dragStartX.value = translateX.value;
      dragStartY.value = translateY.value;
      dragged.value = false;
    })
    .onUpdate((e) => {
      dragged.value = true;
      translateX.value = dragStartX.value + e.translationX;
      translateY.value = dragStartY.value + e.translationY;
    })
    .onEnd(() => {
      if (!dragged.value) return;
      runOnJS(snapToCorner)(translateX.value, translateY.value);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, Gesture.Native());

  const ready = containerWidth > 0 && containerHeight > 0;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return { composedGesture, animatedStyle, ready };
}
