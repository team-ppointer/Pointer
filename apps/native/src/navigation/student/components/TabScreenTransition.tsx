import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyleSheet, View, ViewProps, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  SharedValue,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Standard 300ms transition time
const TRANSITION_DURATION = 300;

type TabTransitionContextType = {
  currentIndex: SharedValue<number>;
  prevIndex: SharedValue<number>;
  translateProgress: SharedValue<number>;
  opacityProgress: SharedValue<number>;
  setIndex: (index: number) => void;
  // We keep track of which screens should be "mounted" (rendered) 
  // to save resources and avoid the "ghost" lag.
  mountedIndices: number[];
};

const TabTransitionContext = createContext<TabTransitionContextType | null>(null);

export const useTabTransition = () => {
  const context = useContext(TabTransitionContext);
  if (!context) {
    throw new Error('useTabTransition must be used within a TabTransitionProvider');
  }
  return context;
};

type TabTransitionProviderProps = {
  children: React.ReactNode;
  initialIndex?: number;
};

export const TabTransitionProvider = ({ children, initialIndex = 0 }: TabTransitionProviderProps) => {
  const currentIndex = useSharedValue(initialIndex);
  const prevIndex = useSharedValue(initialIndex);
  const translateProgress = useSharedValue(1);
  const opacityProgress = useSharedValue(1);
  
  // State to control actual rendering (mounting/unmounting)
  // Initially only the start index is mounted.
  const [mountedIndices, setMountedIndices] = useState<number[]>([initialIndex]);

  const setIndex = useCallback((index: number) => {
    // If clicking same tab, do nothing (except ensuring it's mounted?)
    if (index === currentIndex.value) return;

    // 1. Mount the new screen immediately so it can render
    //    We keep the old one mounted too during transition.
    const oldIndex = currentIndex.value;
    setMountedIndices((prev) => {
      const unique = new Set([...prev, index, oldIndex]);
      return Array.from(unique);
    });

    // 2. Start Animation Reanimated values
    prevIndex.value = oldIndex;
    currentIndex.value = index;

    // Start from 0 each transition
    translateProgress.value = 0;
    opacityProgress.value = 0;

    // Translate: spring for a "native" feel
    translateProgress.value = withSpring(1, {
      // Smoother, less snappy, and explicitly no-overshoot
      damping: 26,
      stiffness: 180,
      mass: 1.1,
      overshootClamping: true,
    });

    // Opacity: timing for a clean fade
    opacityProgress.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });

    // 3. Cleanup (Unmount) old screens after animation + small buffer
    setTimeout(() => {
      setMountedIndices([index]);
    }, 300 + 120);

  }, [currentIndex, prevIndex, translateProgress, opacityProgress]);

  return (
    <TabTransitionContext.Provider value={{ currentIndex, prevIndex, translateProgress, opacityProgress, setIndex, mountedIndices }}>
      {children}
    </TabTransitionContext.Provider>
  );
};

type TabScreenProps = ViewProps & {
  index: number;
  children: React.ReactNode;
};

export const TabScreen = ({ index, children, style, ...props }: TabScreenProps) => {
  const { currentIndex, prevIndex, translateProgress, opacityProgress, mountedIndices } = useTabTransition();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  
  // Move optimization check AFTER hook calls to follow Rules of Hooks
  
  const animatedStyle = useAnimatedStyle(() => {
    const curr = currentIndex.value;
    const prev = prevIndex.value;
    const t = translateProgress.value;
    const o = opacityProgress.value;

    const isEntering = index === curr;
    const isExiting = index === prev;

    const direction = curr > prev ? 1 : -1;
    const OFFSET = 40; // Slide distance (smaller feels more native)

    let translateX = 0;
    let opacity = 1; // Default 1 for static/active case
    let zIndex = 0;

    if (isEntering) {
      // 0 -> 1: Slide In from Right/Left
      translateX = interpolate(t, [0, 1], [direction * OFFSET, 0], Extrapolation.CLAMP);
      opacity = interpolate(o, [0, 1], [0, 1], Extrapolation.CLAMP);
      zIndex = 1;
    } else if (isExiting) {
      // 0 -> 1: Slide Out to Left/Right
      translateX = interpolate(t, [0, 1], [0, -direction * OFFSET], Extrapolation.CLAMP);
      opacity = interpolate(o, [0, 1], [1, 0], Extrapolation.CLAMP);
      zIndex = 0;
    } else if (index === curr) {
       // Stable state (animation done)
       translateX = 0;
       opacity = 1;
       zIndex = 1;
    } else {
       // Should be handled by return null below, but for safety in reanimated thread:
       opacity = 0;
       zIndex = -1;
    }

    return {
      transform: [{ translateX }],
      opacity,
      zIndex,
      // Ensure we fill the container to help SafeArea layout
      width: '100%',
      height: '100%',
      paddingTop: insets.top, // Sync Safe Area Top
    };
  });

  // Optimization: If NOT mounted, return null immediately.
  // This effectively "unmounts" the heavier screen content.
  if (!mountedIndices.includes(index)) {
    return null;
  }

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        style,
        animatedStyle,
      ]}
      pointerEvents={isFocused ? 'auto' : 'none'}
      {...props}>
      {children}
    </Animated.View>
  );
};
