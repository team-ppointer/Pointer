import React, { ReactNode, useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type AnimatedPressableProps = PressableProps & {
  children?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  animatedStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};

/**
 * 애니메이션이 적용된 Pressable 컴포넌트
 *
 * Press 시:
 * - Scale: 1 → 0.95 (spring, tension: 300, friction: 10)
 * - Opacity: 1 → 0.7 (timing, 100ms)
 *
 * Release 시:
 * - Scale: 0.95 → 1 (spring, tension: 300, friction: 10)
 * - Opacity: 0.7 → 1 (timing, 150ms)
 */
const AnimatedPressable = ({
  children,
  onPressIn,
  onPressOut,
  containerStyle,
  animatedStyle,
  style,
  ...rest
}: AnimatedPressableProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  // Inner content with native driver animations (scale, opacity)
  const innerContent = (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }, containerStyle]}>
      <Pressable style={style} onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
        {children}
      </Pressable>
    </Animated.View>
  );

  // If animatedStyle is provided (non-native driver), wrap with another Animated.View
  if (animatedStyle) {
    return (
      <Animated.View style={[{ borderRadius: 8, overflow: 'hidden' }, animatedStyle]}>
        {innerContent}
      </Animated.View>
    );
  }

  return innerContent;
};

export default AnimatedPressable;
