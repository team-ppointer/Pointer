import React from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Bell, Bookmark, ChevronLeft, Home, Menu, MessageCircleMore } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { newColors } from '@/theme/tokens';
import HomeScreen from '../../features/student/home/screens/HomeScreen';
import ScrapScreen from '../../features/student/scrap/screens/ScrapScreen';
import QnaScreen from '../../features/student/qna/screens/QnaScreen';
import MenuScreen from '../../features/student/menu/screens/MenuScreen';
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
// import { useNotificationNavigation } from '@/hooks/useNotificationNavigator';
import NotificationScreen from '@/features/student/home/screens/notifications/NotificationsScreen';
import {
  AlertBellButtonIcon,
  BookmarkFilledIcon,
  HomeFilledIcon,
  MessageCircleMoreFilledIcon,
} from '@components/system/icons';
import NotificationDetailScreen from '@features/student/home/screens/notifications/NotificationDetailScreen';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../RootNavigator';

export type StudentTabParamList = {
  Home: undefined;
  Scrap: undefined;
  Qna: undefined;
  AllMenu: undefined;
};

const HomeHeader = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView edges={['top']} className='bg-blue-100'>
      <View className='flex-row justify-between px-6 py-3.5 md:px-[60px] lg:px-32'>
        <Image className='h-[40px]' source={require('../../../assets/images/pointer-logo.png')} />
        <TouchableOpacity
          onPress={() => navigation.push('Notifications')}
          className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'>
          {/* <Bell className='h-[24px]' style={{ aspectRatio: 1 }} color='#0C0C0D' /> */}
          <AlertBellButtonIcon></AlertBellButtonIcon>
          {/* Check for verify icon in actual UI */}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

interface NotificationHeaderProps extends NativeStackHeaderProps {
  title: string;
}

const NotificationHeader = ({ back, title }: NotificationHeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView edges={['top']} className=''>
      <View className='flex-row items-center justify-between px-5 py-3.5'>
        {back ? (
          <TouchableOpacity onPress={() => navigation.goBack()} className='p-2'>
            <ChevronLeft className='text-black' size={32} />
          </TouchableOpacity>
        ) : (
          <View className='h-[48px] w-[48px] gap-[10px]' />
        )}
        <Text className='text-20b text-gray-900' style={{ lineHeight: 30 }}>
          {title}
        </Text>
        <View className='h-[48px] w-[48px] gap-[10px]' />
      </View>
    </SafeAreaView>
  );
};

// StackNavigator for Home <-> Notifications
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='HomeMain'
        component={HomeScreen}
        options={{ header: () => <HomeHeader /> }}
      />
      <Stack.Screen
        name='Notifications'
        component={NotificationScreen}
        options={{ header: (props) => <NotificationHeader title='알림' {...props} /> }}
      />
      <Stack.Screen
        name='NotificationDetail'
        component={NotificationDetailScreen}
        options={{ header: (props) => <NotificationHeader title='공지' {...props} /> }}
      />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

const MainTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className='items-center justify-center bg-gray-100 pt-[4px]'
      style={{
        paddingBottom: 4 + insets.bottom,
      }}>
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
                    color={isFocused ? newColors['primary-500'] : newColors['gray-800']}
                  />
                </View>
              )}
              <Text className={isFocused ? 'text-14b text-primary-500' : 'text-14m text-gray-800'}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const StudentNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name='Home' component={HomeStack} />
      <Tab.Screen name='Scrap' component={ScrapScreen} />
      <Tab.Screen name='Qna' component={QnaScreen} />
      <Tab.Screen name='AllMenu' component={MenuScreen} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
