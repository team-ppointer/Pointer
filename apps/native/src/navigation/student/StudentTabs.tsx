import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

import { HomeScreen } from '@features/student/home';
import { ScrapScreen } from '@features/student/scrap';
import { QnaScreen } from '@features/student/qna';

import { type StudentTabParamList } from './types';
import MenuNavigator from './MenuNavigator';
import MainTabBar from './components/MainTabBar';
import HomeHeader from './components/HomeHeader';
import { TabScreen, TabTransitionProvider } from './components/TabScreenTransition';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const HomeWrapped = (props: any) => (
  <TabScreen index={0}>
    <View className='flex-1'>
      <HomeHeader />
      <HomeScreen {...props} />
    </View>
  </TabScreen>
);

const ScrapWrapped = (props: any) => (
  <TabScreen index={1}>
    <ScrapScreen {...props} />
  </TabScreen>
);

const QnaWrapped = (props: any) => (
  <TabScreen index={2}>
    <QnaScreen {...props} />
  </TabScreen>
);

const MenuWrapped = (props: any) => (
  <TabScreen index={3}>
    <MenuNavigator {...props} />
  </TabScreen>
);

const StudentTabs = () => {
  return (
    <TabTransitionProvider>
      <Tab.Navigator
        tabBar={(props) => <MainTabBar {...props} />}
        detachInactiveScreens={false} // Important: Keep all screens mounted
        screenOptions={{
          headerShown: false,
          animation: 'none', // Disable default animation
        }}>
        <Tab.Screen
          name='Home'
          component={HomeWrapped}
          options={{
            headerShown: false, // We render header inside the wrapper
          }}
        />
        <Tab.Screen name='Scrap' component={ScrapWrapped} />
        <Tab.Screen name='Qna' component={QnaWrapped} />
        <Tab.Screen name='AllMenu' component={MenuWrapped} />
      </Tab.Navigator>
    </TabTransitionProvider>
  );
};

export default StudentTabs;
