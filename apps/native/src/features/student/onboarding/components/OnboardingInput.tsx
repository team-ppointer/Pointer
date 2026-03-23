import {
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';
import { AlertCircle, CircleCheck } from 'lucide-react-native';

import { colors } from '@theme/tokens';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  errorMessage?: string;
  successMessage?: string;
  rightAccessory?: ReactNode;
  onPressAccessory?: () => void;
  containerClassName?: string;
};

const OnboardingInput = forwardRef(
  (
    {
      label,
      hint,
      errorMessage,
      successMessage,
      rightAccessory,
      onPressAccessory,
      containerClassName = '',
      onFocus,
      onBlur,
      editable = true,
      style,
      ...inputProps
    }: Props,
    ref: ForwardedRef<TextInput>
  ) => {
    const innerRef = useRef<TextInput>(null);
    useImperativeHandle(ref, () => innerRef.current as TextInput);

    const [isFocused, setIsFocused] = useState(false);

    const borderStyle = useMemo(() => {
      if (errorMessage) {
        return { borderColor: colors['red-400'], borderWidth: 1 };
      }
      if (successMessage) {
        return { borderColor: colors['blue-500'], borderWidth: 1 };
      }
      if (isFocused) {
        return { borderColor: colors['gray-600'], borderWidth: 1 };
      }
      return { borderColor: colors['gray-300'], borderWidth: 1 };
    }, [errorMessage, isFocused, successMessage]);

    const handleFocus = useCallback(
      (event: any) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: any) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    const textInputStyle = useMemo(() => {
      const base: TextInputProps['style'][] = [{ paddingVertical: 0, lineHeight: 20 }];
      if (style) base.push(style);
      return base;
    }, [style]);

    return (
      <View className={`w-full ${containerClassName}`}>
        {label ? <Text className='text-14m mb-[6px] text-gray-900'>{label}</Text> : null}
        <Pressable
          onPress={() => innerRef.current?.focus()}
          className={`h-[48px] flex-row items-center rounded-[10px] bg-white px-[16px] ${
            editable ? '' : 'bg-gray-200'
          }`}
          style={borderStyle}>
          <TextInput
            ref={innerRef}
            {...inputProps}
            style={textInputStyle}
            editable={editable}
            placeholderTextColor={colors['gray-600']}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className='text-16r flex-1 text-black'
          />
          {rightAccessory ? (
            <Pressable
              onPress={onPressAccessory}
              disabled={!onPressAccessory}
              hitSlop={8}
              className='ml-[8px] h-[24px] w-[24px] items-center justify-center'>
              {rightAccessory}
            </Pressable>
          ) : null}
        </Pressable>
        {hint ? <Text className='text-12r ml-[4px] mt-[8px] text-[#808087]'>{hint}</Text> : null}
        {errorMessage ? (
          <View className='mt-[8px] flex-row items-center gap-[4px]'>
            <AlertCircle size={14} color={colors['red-400']} />
            <Text className='text-12r text-red-400'>{errorMessage}</Text>
          </View>
        ) : null}
        {successMessage ? (
          <View className='mt-[8px] flex-row items-center gap-[4px]'>
            <CircleCheck size={14} color={colors['blue-500']} />
            <Text className='text-12r text-blue-500'>{successMessage}</Text>
          </View>
        ) : null}
      </View>
    );
  }
);

OnboardingInput.displayName = 'OnboardingInput';

export default OnboardingInput;
