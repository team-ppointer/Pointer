import React from 'react';
import { Text, ViewStyle } from 'react-native';
import { AnimatedPressable } from '@components/common';

interface ButtonProps {
  variant?: 'blue' | 'gray' | 'outline';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

const TextButton = ({
  variant = 'blue',
  disabled = false,
  onPress,
  children,
  style,
}: ButtonProps) => {
  const baseStyle = 'h-[32px] w-fit items-center justify-center rounded-[8px] px-[10px]';

  const variantStyles = {
    blue: 'bg-blue-500',
    gray: 'bg-gray-800',
    outline: 'bg-blue-200',
  };

  const textStyles = {
    blue: 'text-white text-14m',
    gray: 'text-white text-14m',
    outline: 'text-blue-600 text-14m',
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]}`}
      style={style}>
      <Text className={textStyles[variant]}>{children}</Text>
    </AnimatedPressable>
  );
};

export default TextButton;
