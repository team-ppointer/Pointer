import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Undo2, Redo2 } from 'lucide-react-native';

import { PencilFilledIcon, EraserFilledIcon } from '@components/system/icons';
import { colors } from '@theme/tokens';
import { AnimatedPressable } from '@components/common';

interface ProblemDrawingToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isEraserMode: boolean;
  onPenModePress: () => void;
  onEraserModePress: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  containerWidth: number;
  containerHeight: number;
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const BUTTON_SIZE = 42;
const BUTTON_RADIUS = 12;
const ICON_SIZE = 20;
const PADDING = 10;
const GAP = 10;
const DIVIDER_WIDTH = 1;
const SCREEN_MARGIN = 24;
const EXPANDED_RADIUS = 24;
const COLLAPSED_RADIUS = 20;

const EXPANDED_W =
  PADDING +
  BUTTON_SIZE +
  GAP +
  BUTTON_SIZE +
  GAP +
  DIVIDER_WIDTH +
  GAP +
  BUTTON_SIZE +
  GAP +
  BUTTON_SIZE +
  PADDING;
const TOOLBAR_H = PADDING + BUTTON_SIZE + PADDING;
const COLLAPSED_W = TOOLBAR_H;
const SPRING = { damping: 20, stiffness: 220, mass: 0.8 };
const LONG_PRESS_MS = 1000;

const cornerXY = (corner: Corner, width: number, cw: number, ch: number) => {
  const x = corner.endsWith('left') ? SCREEN_MARGIN : cw - width - SCREEN_MARGIN;
  const y = corner.startsWith('top') ? SCREEN_MARGIN : ch - TOOLBAR_H - SCREEN_MARGIN;
  return { x, y };
};

const SHADOW = {
  shadowColor: '#1E1E21',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 4.5,
  elevation: 3,
};

export const ProblemDrawingToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isEraserMode,
  onPenModePress,
  onEraserModePress,
  collapsed,
  onCollapsedChange,
  containerWidth,
  containerHeight,
}: ProblemDrawingToolbarProps) => {
  const [corner, setCorner] = useState<Corner>('bottom-left');
  const width = collapsed ? COLLAPSED_W : EXPANDED_W;

  const translateX = useSharedValue(SCREEN_MARGIN);
  const translateY = useSharedValue(SCREEN_MARGIN);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const dragged = useSharedValue(false);

  useEffect(() => {
    if (containerWidth <= 0 || containerHeight <= 0) return;
    const { x, y } = cornerXY(corner, width, containerWidth, containerHeight);
    translateX.value = withSpring(x, SPRING);
    translateY.value = withSpring(y, SPRING);
  }, [corner, width, containerWidth, containerHeight, translateX, translateY]);

  const snapToCorner = useCallback(
    (x: number, y: number) => {
      if (containerWidth <= 0 || containerHeight <= 0) return;
      const cx = x + width / 2;
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

      const { x: tx, y: ty } = cornerXY(next, width, containerWidth, containerHeight);
      translateX.value = withSpring(tx, SPRING);
      translateY.value = withSpring(ty, SPRING);
      setCorner(next);
    },
    [containerWidth, containerHeight, width, corner, translateX, translateY]
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, ...SHADOW }, animatedStyle]}>
        {collapsed ? (
          <CollapsedToolbar isEraserMode={isEraserMode} onPress={() => onCollapsedChange(false)} />
        ) : (
          <ExpandedToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            isEraserMode={isEraserMode}
            onPenModePress={onPenModePress}
            onEraserModePress={onEraserModePress}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const ExpandedToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isEraserMode,
  onPenModePress,
  onEraserModePress,
}: Pick<
  ProblemDrawingToolbarProps,
  | 'canUndo'
  | 'canRedo'
  | 'onUndo'
  | 'onRedo'
  | 'isEraserMode'
  | 'onPenModePress'
  | 'onEraserModePress'
>) => (
  <View
    className='flex-row items-center justify-center bg-gray-200'
    style={{
      paddingHorizontal: PADDING,
      paddingVertical: PADDING,
      gap: GAP,
      borderRadius: EXPANDED_RADIUS,
      borderWidth: 1,
      borderColor: colors['gray-400'],
    }}>
    <ToolbarButton
      onPress={onUndo}
      disabled={!canUndo}
      activeBg={colors['gray-400']}
      icon={
        <Undo2
          size={ICON_SIZE}
          color={canUndo ? colors['gray-900'] : colors['gray-500']}
          strokeWidth={1.75}
        />
      }
      isActive={canUndo}
    />
    <ToolbarButton
      onPress={onRedo}
      disabled={!canRedo}
      activeBg={colors['gray-400']}
      icon={
        <Redo2
          size={ICON_SIZE}
          color={canRedo ? colors['gray-900'] : colors['gray-500']}
          strokeWidth={1.75}
        />
      }
      isActive={canRedo}
    />
    <View
      style={{
        width: DIVIDER_WIDTH,
        alignSelf: 'stretch',
        backgroundColor: colors['gray-500'],
      }}
    />
    <ToolbarButton
      onPress={onPenModePress}
      activeBg={colors['primary-200']}
      icon={
        <PencilFilledIcon
          size={ICON_SIZE}
          color={!isEraserMode ? colors['primary-700'] : colors['gray-900']}
        />
      }
      isActive={!isEraserMode}
    />
    <ToolbarButton
      onPress={onEraserModePress}
      activeBg={colors['primary-200']}
      icon={
        <EraserFilledIcon
          size={ICON_SIZE}
          color={isEraserMode ? colors['primary-700'] : colors['gray-900']}
        />
      }
      isActive={isEraserMode}
    />
  </View>
);

const CollapsedToolbar = ({
  isEraserMode,
  onPress,
}: {
  isEraserMode: boolean;
  onPress: () => void;
}) => (
  <View
    className='items-center justify-center bg-gray-200'
    style={{
      width: COLLAPSED_W,
      height: TOOLBAR_H,
      borderRadius: COLLAPSED_RADIUS,
      borderWidth: 1,
      borderColor: colors['gray-400'],
      padding: PADDING,
    }}>
    <AnimatedPressable
      onPress={onPress}
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_RADIUS,
        backgroundColor: colors['primary-200'],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {isEraserMode ? (
        <EraserFilledIcon size={ICON_SIZE} color={colors['primary-700']} />
      ) : (
        <PencilFilledIcon size={ICON_SIZE} color={colors['primary-700']} />
      )}
    </AnimatedPressable>
  </View>
);

const ToolbarButton = ({
  onPress,
  disabled,
  isActive,
  activeBg,
  icon,
}: {
  onPress: () => void;
  disabled?: boolean;
  isActive?: boolean;
  activeBg: string;
  icon: React.ReactNode;
}) => (
  <AnimatedPressable
    onPress={onPress}
    disabled={disabled}
    style={{
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isActive ? activeBg : 'transparent',
    }}>
    {icon}
  </AnimatedPressable>
);
