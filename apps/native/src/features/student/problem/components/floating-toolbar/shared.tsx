import { View } from 'react-native';

import { AnimatedPressable } from '@components/common';
import { colors } from '@theme/tokens';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const BUTTON_SIZE = 42;
export const BUTTON_RADIUS = 12;
export const ICON_SIZE = 20;
export const PADDING = 10;
export const GAP = 10;
export const DIVIDER_WIDTH = 1;
export const SCREEN_MARGIN = 24;
export const EXPANDED_RADIUS = 24;
export const COLLAPSED_RADIUS = 20;
export const COLOR_BTN_SIZE = 28;
export const COLOR_CIRCLE_SIZE = 24;
export const COLOR_GRID_GAP = 4;
export const COLOR_GRID_W = COLOR_BTN_SIZE * 2 + COLOR_GRID_GAP;
export const TOOLBAR_H = PADDING + BUTTON_SIZE + PADDING;
export const COLLAPSED_W = TOOLBAR_H;
export const SPRING = { damping: 20, stiffness: 220, mass: 0.8 };
export const LONG_PRESS_MS = 1000;

export const SHADOW = {
  shadowColor: '#1E1E21',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 4.5,
  elevation: 3,
} as const;

export const cornerXY = (corner: Corner, width: number, cw: number, ch: number) => {
  const x = corner.endsWith('left') ? SCREEN_MARGIN : cw - width - SCREEN_MARGIN;
  const y = corner.startsWith('top') ? SCREEN_MARGIN : ch - TOOLBAR_H - SCREEN_MARGIN;
  return { x, y };
};

interface ToolbarButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isActive?: boolean;
  activeBg: string;
  icon: React.ReactNode;
}

export const ToolbarButton = ({
  onPress,
  disabled,
  isActive,
  activeBg,
  icon,
}: ToolbarButtonProps) => (
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

export const ToolbarDivider = () => (
  <View
    style={{
      width: DIVIDER_WIDTH,
      alignSelf: 'stretch',
      backgroundColor: colors['gray-500'],
    }}
  />
);

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
}

export const ColorSwatch = ({ color, selected, onPress }: ColorSwatchProps) => (
  <AnimatedPressable
    onPress={onPress}
    style={{
      width: COLOR_BTN_SIZE,
      height: COLOR_BTN_SIZE,
      borderRadius: COLOR_BTN_SIZE / 2,
      borderWidth: 1,
      borderColor: selected ? colors['primary-600'] : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <View
      style={{
        width: COLOR_CIRCLE_SIZE,
        height: COLOR_CIRCLE_SIZE,
        borderRadius: COLOR_CIRCLE_SIZE / 2,
        backgroundColor: color,
      }}
    />
  </AnimatedPressable>
);
