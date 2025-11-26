import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Image } from 'react-native';
import { Bell, Bookmark, Home, Menu, MessageCircleMore } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { newColors } from '@/theme/tokens';
import HomeScreen from '../../features/student/home/screens/HomeScreen';
import ScrapScreen from '../../features/student/scrap/screens/ScrapScreen';
import QnaScreen from '../../features/student/qna/screens/QnaScreen';
import MenuScreen from '../../features/student/menu/screens/MenuScreen';

export type StudentTabParamList = {
  Home: undefined;
  Scrap: undefined;
  Qna: undefined;
  AllMenu: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

const BrandHeader = () => (
  <SafeAreaView edges={['top']} className='bg-blue-100'>
    <View className='flex-row justify-between px-6 py-3.5 md:px-[60px] lg:px-32'>
      <Image className='h-[40px]' source={require('../../../assets/images/pointer-logo.png')} />
      <View className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'>
        <Bell className='h-[24px]' style={{ aspectRatio: 1 }} color='#0C0C0D' />
      </View>
    </View>
  </SafeAreaView>
);

const tabLabel =
  (label: string) =>
  ({ focused }: { focused: boolean }) => (
    <Text
      className='text-14sb'
      style={{
        color: focused ? newColors['primary-500'] : newColors['gray-800'],
      }}>
      {label}
    </Text>
  );

const StudentNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingHorizontal: 226,
          gap: 10,
          backgroundColor: newColors['gray-100'],
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
          paddingBottom: 4 + insets.bottom,
        },
      }}>
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          header: () => <BrandHeader />,
          headerShown: true,
          tabBarLabel: tabLabel('홈'),
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? newColors['primary-500'] : newColors['gray-800']} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name='Scrap'
        component={ScrapScreen}
        options={{
          tabBarLabel: tabLabel('스크랩'),
          tabBarIcon: ({ focused }) => (
            <Bookmark
              color={focused ? newColors['primary-500'] : newColors['gray-800']}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Qna'
        component={QnaScreen}
        options={{
          tabBarLabel: tabLabel('QnA'),
          tabBarIcon: ({ focused }) => (
            <MessageCircleMore
              color={focused ? newColors['primary-500'] : newColors['gray-800']}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name='AllMenu'
        component={MenuScreen}
        options={{
          tabBarLabel: tabLabel('전체 메뉴'),
          tabBarIcon: ({ focused }) => (
            <Menu color={focused ? newColors['primary-500'] : newColors['gray-800']} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
