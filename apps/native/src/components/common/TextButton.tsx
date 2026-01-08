import React from 'react';
import { Pressable, PressableStateCallbackType, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  variant?: 'blue' | 'gray' | 'outline';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

type ExtendedPressableState = PressableStateCallbackType & { hovered?: boolean };

const TextButton = ({
  variant = 'blue',
  disabled = false,
  onPress,
  children,
  style,
}: ButtonProps) => {
  const baseStyle = 'h-[32px] w-fit items-center justify-center rounded-[8px] px-[10px]';

  const variantStyles = {
    blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    gray: 'bg-gray-800 hover:bg-gray-900 active:bg-[#0E0E10]',
    outline: 'bg-blue-200 hover:bg-blue-200 active:bg-blue-200',
  };

  const textStyles = {
    blue: 'text-white text-14m',
    gray: 'text-white text-14m',
    outline: 'text-blue-600 text-14m',
  };

  return (
    <Pressable onPress={onPress} className={`${baseStyle} ${variantStyles[variant]}`} style={style}>
      <Text className={textStyles[variant]}>{children}</Text>
    </Pressable>
  );
};

export default TextButton;
