import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { Undo2, Redo2 } from 'lucide-react-native';

import { AnimatedPressable } from '@components/common';
import { EraserFilledIcon, PencilFilledIcon } from '@components/system/icons';
import { colors } from '@theme/tokens';

import {
  BUTTON_RADIUS,
  BUTTON_SIZE,
  COLLAPSED_RADIUS,
  COLLAPSED_W,
  type Corner,
  DIVIDER_WIDTH,
  EXPANDED_RADIUS,
  GAP,
  ICON_SIZE,
  PADDING,
  SHADOW,
  TOOLBAR_H,
  ToolbarButton,
  ToolbarDivider,
} from './shared';
import { useFloatingToolbarSnap } from './useFloatingToolbarSnap';

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
  initialCorner?: Corner;
}

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
  initialCorner = 'bottom-left',
}: ProblemDrawingToolbarProps) => {
  const toolbarWidth = collapsed ? COLLAPSED_W : EXPANDED_W;
  const { composedGesture, animatedStyle, ready } = useFloatingToolbarSnap({
    containerWidth,
    containerHeight,
    toolbarWidth,
    initialCorner,
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, opacity: ready ? 1 : 0, ...SHADOW },
          animatedStyle,
        ]}>
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
    <ToolbarDivider />
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
