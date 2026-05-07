import React, { useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Pressable, Text } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Bookmark, Home, Menu, MessageCircleMore } from 'lucide-react-native';

import {
  AlertBellButtonIcon,
  BookmarkFilledIcon,
  HomeFilledIcon,
  MessageCircleMoreFilledIcon,
} from '@components/system/icons';
import { colors } from '@theme/tokens';
import { ContentInset } from '@components/common';
import { useGetNoticeCount, useGetNotificationCount } from '@apis';

import { useTabTransition } from './TabScreenTransition';

type IconProps = {
  size: number;
  color: string;
};

type TabItemProps = {
  isFocused: boolean;
  label: string;
  IconComponent: React.ComponentType<IconProps> | null;
  onPress: () => void;
  onLongPress: () => void;
};

const AnimatedTabItem = ({
  isFocused,
  label,
  IconComponent,
  onPress,
  onLongPress,
}: TabItemProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className='w-[90px] items-center justify-center'>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className='items-center'>
        {IconComponent && (
          <View className='size-[32px] items-center justify-center'>
            <IconComponent
              size={22}
              color={isFocused ? colors['primary-600'] : colors['gray-600']}
            />
          </View>
        )}
        <Text
          className={
            isFocused ? 'typo-label-semibold text-primary-600' : 'typo-label-semibold text-gray-600'
          }>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const MainTabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { setIndex } = useTabTransition();
  const { height: screenHeight } = Dimensions.get('window');

  const { data: notificationCountData } = useGetNotificationCount({});
  const { data: noticeCountData } = useGetNoticeCount();
  const hasUnread = !!(notificationCountData?.unreadCount || noticeCountData?.unreadCount);

  // Sync animation state with navigation state
  React.useEffect(() => {
    setIndex(state.index);
  }, [state.index, setIndex]);

  const { options } = descriptors[state.routes[state.index].key];
  const tabBarStyle = options.tabBarStyle as { display?: string } | undefined;
  const isTabBarVisible = !(
    tabBarStyle &&
    typeof tabBarStyle === 'object' &&
    tabBarStyle.display === 'none'
  );

  // If tab bar is hidden, we usually just want full screen content.
  // But our architecture relies on this component rendering the content to hide the default navigator.
  // So we still render content, just maybe not the bar.

  // Tab Bar Height Calculation
  // Top padding: 4px
  // Icon: 32px
  // Text: ~17px (line height of 14b)
  // Spacing/Padding: ~10px
  // Total content ~ 60px + Inset
  const TAB_BAR_HEIGHT = 65 + insets.bottom;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors['gray-100'] }]}>
        {state.routes.map((route, i) => {
          const { render } = descriptors[route.key];
          return (
            <View
              key={route.key}
              style={[
                StyleSheet.absoluteFill,
                { paddingBottom: isTabBarVisible ? TAB_BAR_HEIGHT : 0 },
              ]}>
              {render()}
            </View>
          );
        })}
      </View>

      {isTabBarVisible && (
        <View
          className='absolute inset-x-0 bottom-0 z-50 items-center justify-center bg-gray-100 pt-[4px]'
          style={{ paddingBottom: 4 + insets.bottom }}
          pointerEvents='box-none'>
          {/* Tab Bar Content */}
          <ContentInset className='flex-row justify-around'>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              let label = '';
              let IconComponent: React.ComponentType<IconProps> | null = null;

              switch (route.name) {
                case 'Home':
                  label = '홈';
                  IconComponent = isFocused ? HomeFilledIcon : Home;
                  break;
                case 'Scrap':
                  label = '스크랩';
                  IconComponent = isFocused ? BookmarkFilledIcon : Bookmark;
                  break;
                case 'Qna':
                  label = 'QnA';
                  IconComponent = isFocused ? MessageCircleMoreFilledIcon : MessageCircleMore;
                  break;
                case 'Notification':
                  label = '알림';
                  IconComponent = hasUnread ? AlertBellButtonIcon : Bell;
                  break;
                case 'AllMenu':
                  label = '전체 메뉴';
                  IconComponent = Menu;
                  break;
                default:
                  label = route.name;
              }

              return (
                <AnimatedTabItem
                  key={route.key}
                  isFocused={isFocused}
                  label={label}
                  IconComponent={IconComponent}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </ContentInset>
        </View>
      )}
    </View>
  );
};

export default MainTabBar;
