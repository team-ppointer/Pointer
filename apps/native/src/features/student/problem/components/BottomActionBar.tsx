import { Container } from '@components/common';
import React, { ReactNode, useRef } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

type BottomActionBarProps = {
  bottomInset?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: ReactNode;
};

type BottomActionBarButtonProps = PressableProps & {
  className?: string;
  children?: ReactNode;
  animatedStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  containerStyle?: StyleProp<ViewStyle>;
};

type BottomActionBarComponent = ((props: BottomActionBarProps) => React.ReactElement) & {
  Button: (props: BottomActionBarButtonProps) => React.ReactElement;
};

const combineClassName = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ');

const BottomActionBarButton = ({
  className,
  children,
  onPressIn,
  onPressOut,
  animatedStyle,
  containerStyle,
  ...rest
}: BottomActionBarButtonProps) => {
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

  // Separate Animated.Views: outer for non-native (backgroundColor), inner for native (scale, opacity)
  const innerContent = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <Pressable
        className={combineClassName(
          'items-center justify-center rounded-[8px] px-[18px] h-[42px]',
          className
        )}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}>
        {children}
      </Pressable>
    </Animated.View>
  );

  if (animatedStyle) {
    return (
      <Animated.View
        style={[{ borderRadius: 8, overflow: 'hidden' }, animatedStyle, containerStyle]}>
        {innerContent}
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{innerContent}</View>;
};

const BottomActionBar = (({ bottomInset = 0, onLayout, children }: BottomActionBarProps) => (
  <View
    className='border-t border-gray-300 bg-white pt-[10px]'
    style={{ paddingBottom: 10 + bottomInset }}
    onLayout={onLayout}>
    <Container className='flex-row items-center gap-[10px]'>{children}</Container>
  </View>
)) as BottomActionBarComponent;

BottomActionBar.Button = BottomActionBarButton;

export default BottomActionBar;
