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
      // Native splash screen hiding
      SplashScreen.hideAsync().then(() => {
        // Start fade out animation
        opacity.value = withTiming(0, { duration: 500 }, (finished) => {
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
    <Animated.View className='flex-1 items-center justify-center bg-gray-100 gap-[20px]'>
      <Text className='text-16r text-gray-700 text-center'>문제를 접근하고{'\n'}생각하는 방식을 바꾸는</Text>
      <PointerLogo />
      <View className='h-[50px]' />
    </Animated.View>
  );
};
