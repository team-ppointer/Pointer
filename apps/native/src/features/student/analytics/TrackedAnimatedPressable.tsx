import React from 'react';
import { type GestureResponderEvent } from 'react-native';

import AnimatedPressable from '@/components/common/AnimatedPressable';

import type { ButtonId, ScreenName } from './types';

import { analytics } from './index';

type AnimatedPressableProps = React.ComponentProps<typeof AnimatedPressable>;

interface TrackedAnimatedPressableProps extends AnimatedPressableProps {
  /** Button ID for analytics tracking */
  buttonId: ButtonId;
  /** Optional button label for analytics */
  buttonLabel?: string;
  /** Override screen name (defaults to current screen from analytics) */
  screenName?: ScreenName;
}

/**
 * AnimatedPressable with built-in analytics tracking
 *
 * Usage:
 *   <TrackedAnimatedPressable
 *     buttonId="start_study"
 *     onPress={handleStart}
 *   >
 *     <Text>Start</Text>
 *   </TrackedAnimatedPressable>
 */
const TrackedAnimatedPressable = ({
  buttonId,
  buttonLabel,
  screenName,
  onPress,
  ...rest
}: TrackedAnimatedPressableProps) => {
  const handlePress = (event: GestureResponderEvent) => {
    // Track button click
    analytics.trackButtonClick(buttonId, buttonLabel, screenName);

    // Call original onPress handler
    onPress?.(event);
  };

  return <AnimatedPressable onPress={handlePress} {...rest} />;
};

export default TrackedAnimatedPressable;
