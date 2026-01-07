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
  const baseStyle = 'h-[30px] w-fit items-center justify-center rounded-[8px] px-[10px] font-24b';

  const variantStyles = {
    blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    gray: 'bg-gray-800 hover:bg-gray-900 active:bg-[#0E0E10]',
    outline: 'border bg-blue-100 border-blue-500 hover:border-blue-600 active:border-blue-700',
  };

  const textStyles = {
    blue: 'text-white text-14m',
    gray: 'text-white text-14m',
    outline: 'text-14m',
  };

  const getOutlineTextColor = ({ hovered, pressed }: ExtendedPressableState) => {
    if (pressed) return 'text-blue-700';
    if (hovered) return 'text-blue-600';
    return 'text-blue-500';
  };

  return (
    <Pressable onPress={onPress} className={`${baseStyle} ${variantStyles[variant]}`} style={style}>
      {(state) => {
        const outlineColorClass = variant === 'outline' ? getOutlineTextColor(state) : '';
        const textClassName =
          variant === 'outline'
            ? `${textStyles[variant]} ${outlineColorClass}`.trim()
            : textStyles[variant];

        return <Text className={textClassName}>{children}</Text>;
      }}
    </Pressable>
  );
};

export default TextButton;
