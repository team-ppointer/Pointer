import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Home, Menu, MessageCircleMore } from 'lucide-react-native';
import {
  BookmarkFilledIcon,
  HomeFilledIcon,
  MessageCircleMoreFilledIcon,
} from '@components/system/icons';
import { colors } from '@/theme/tokens';

type TabItemProps = {
  isFocused: boolean;
  label: string;
  IconComponent: React.ComponentType<any> | null;
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
      className='w-[56px] items-center justify-center'>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className='items-center'>
        {IconComponent && (
          <View className='h-[32px] w-[32px] items-center justify-center'>
            <IconComponent
              size={22}
              color={isFocused ? colors['primary-500'] : colors['gray-600']}
            />
          </View>
        )}
        <Text className={isFocused ? 'text-14b text-primary-500' : 'text-14m text-gray-600'}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const MainTabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  // 현재 활성화된 route의 tabBarStyle을 확인
  const { options } = descriptors[state.routes[state.index].key];
  const tabBarStyle = options.tabBarStyle as { display?: string } | undefined;
  if (tabBarStyle && typeof tabBarStyle === 'object' && tabBarStyle.display === 'none') {
    return null;
  }

  return (
    <View
      className='items-center justify-center bg-gray-100 pt-[4px]'
      style={{ paddingBottom: 4 + insets.bottom }}>
      <View className='w-full max-w-[572px] flex-row justify-between px-[28px]'>
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
          let IconComponent: React.ComponentType<any> | null = null;

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
      </View>
    </View>
  );
};

export default MainTabBar;
