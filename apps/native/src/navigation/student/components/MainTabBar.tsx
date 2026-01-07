import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Home, Menu, MessageCircleMore } from 'lucide-react-native';
import {
  BookmarkFilledIcon,
  HomeFilledIcon,
  MessageCircleMoreFilledIcon,
} from '@components/system/icons';
import { colors } from '@/theme/tokens';

const MainTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

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
            <TouchableOpacity
              key={route.key}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              className='w-[56px] items-center justify-center'
              activeOpacity={0.8}>
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
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MainTabBar;
