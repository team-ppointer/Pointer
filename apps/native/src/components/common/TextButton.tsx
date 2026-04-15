import React from 'react';
import { Text, type ViewStyle } from 'react-native';

import TrackedAnimatedPressable from '@/features/student/analytics/TrackedAnimatedPressable';
import type { ButtonId, ScreenName } from '@/features/student/analytics';

import AnimatedPressable from './AnimatedPressable';

interface ButtonProps {
  variant?: 'blue' | 'gray' | 'outline';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Button ID for analytics tracking (optional) */
  buttonId?: ButtonId;
  /** Button label for analytics (optional) */
  buttonLabel?: string;
  /** Override screen name for analytics (optional) */
  screenName?: ScreenName;
}

const TextButton = ({
  variant = 'blue',
  disabled = false,
  onPress,
  children,
  style,
  buttonId,
  buttonLabel,
  screenName,
}: ButtonProps) => {
  const baseStyle = 'h-[36px] w-fit items-center justify-center rounded-[8px] px-[10px]';

  const variantStyles = {
    blue: 'bg-primary-600',
    gray: 'bg-gray-400',
    outline: 'bg-primary-200',
  };

  const textStyles = {
    blue: 'text-white typo-body-2-medium',
    gray: 'text-black typo-body-2-medium',
    outline: 'text-primary-600 typo-body-2-medium',
  };

  const className = `${baseStyle} ${variantStyles[variant]}`;

  if (buttonId) {
    return (
      <TrackedAnimatedPressable
        onPress={onPress}
        disabled={disabled}
        className={className}
        style={style}
        buttonId={buttonId}
        buttonLabel={buttonLabel}
        screenName={screenName}>
        <Text className={textStyles[variant]}>{children}</Text>
      </TrackedAnimatedPressable>
    );
  }

  return (
    <AnimatedPressable onPress={onPress} disabled={disabled} className={className} style={style}>
      <Text className={textStyles[variant]}>{children}</Text>
    </AnimatedPressable>
  );
};

export default TextButton;
