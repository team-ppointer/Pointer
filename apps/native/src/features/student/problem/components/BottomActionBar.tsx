import React, { type ReactNode, useRef } from 'react';
import {
  Animated,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { ContentInset } from '@components/common';
import { analytics, type ButtonId, type ScreenName } from '@features/student/analytics';
import { shadow } from '@theme/tokens';

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
  /** Button ID for analytics tracking (optional) */
  buttonId?: ButtonId;
  /** Button label for analytics (optional) */
  buttonLabel?: string;
  /** Override screen name for analytics (optional) */
  screenName?: ScreenName;
};

type BottomActionBarComponent = ((props: BottomActionBarProps) => React.ReactElement) & {
  Button: (props: BottomActionBarButtonProps) => React.ReactElement;
};

const combineClassName = (...classNames: (string | undefined)[]) =>
  classNames.filter(Boolean).join(' ');

const BottomActionBarButton = ({
  className,
  children,
  onPressIn,
  onPressOut,
  onPress,
  animatedStyle,
  containerStyle,
  buttonId,
  buttonLabel,
  screenName,
  ...rest
}: BottomActionBarButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
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

  const handlePressOut = (e: GestureResponderEvent) => {
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

  const handlePress = (e: GestureResponderEvent) => {
    // Track button click if buttonId is provided
    if (buttonId) {
      analytics.trackButtonClick(buttonId, buttonLabel, screenName);
    }
    onPress?.(e);
  };

  // Separate Animated.Views: outer for non-native (backgroundColor), inner for native (scale, opacity)
  const innerContent = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <Pressable
        className={combineClassName(
          'h-[48px] items-center justify-center rounded-[8px] px-[18px]',
          className
        )}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
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
    style={{ paddingBottom: 3 + bottomInset, ...shadow.bottomsheet }}
    onLayout={onLayout}>
    <ContentInset className='flex-row items-center gap-[10px]'>{children}</ContentInset>
  </View>
)) as BottomActionBarComponent;

BottomActionBar.Button = BottomActionBarButton;

export default BottomActionBar;
