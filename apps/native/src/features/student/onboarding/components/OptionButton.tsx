import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

import { AnimatedPressable } from '@components/common';
import { colors } from '@theme/tokens';

type Props = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  rightSlot?: ReactNode;
  isCentered?: boolean;
};

const OptionButton = ({
  label,
  description,
  selected,
  onPress,
  rightSlot,
  isCentered = false,
}: Props) => {
  const animValue = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      tension: 200,
      friction: 20,
    }).start();
  }, [selected, animValue]);

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', colors['primary-100']],
  });

  const borderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors['gray-300'], colors['primary-500']],
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      className={`flex-row items-center px-[20px] py-[16px] ${
        isCentered ? 'justify-center' : 'justify-between'
      }`}
      animatedStyle={{
        backgroundColor,
        borderColor,
        borderWidth: 1,
        borderRadius: 8,
      }}>
      <Text className={`text-14m text-black`}>{label}</Text>
      {description && <Text className='text-14r text-gray-600'>{description}</Text>}
      {!description && rightSlot}
    </AnimatedPressable>
  );
};

export default OptionButton;
