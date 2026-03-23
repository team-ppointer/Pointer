import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { PointerLogo } from '@components/system/icons';

type Props = {
  isAppReady: boolean;
  onAnimationFinish: () => void;
};

export const CustomSplashScreen = ({ isAppReady, onAnimationFinish }: Props) => {
  const opacity = useSharedValue(1);
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  useEffect(() => {
    if (isAppReady && !isAnimationStarted) {
      setIsAnimationStarted(true);
      SplashScreen.hideAsync().then(() => {
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onAnimationFinish)();
          }
        });
      });
    }
  }, [isAppReady, isAnimationStarted, onAnimationFinish, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className='absolute z-50 size-full items-center justify-center gap-[20px] bg-gray-100'>
      <Text className='text-16r text-center text-gray-700'>
        문제를 접근하고{'\n'}생각하는 방식을 바꾸는
      </Text>
      <PointerLogo />
      <View className='h-[50px]' />
    </Animated.View>
  );
};
