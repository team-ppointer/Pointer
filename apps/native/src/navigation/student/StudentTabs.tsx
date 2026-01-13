import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentTabParamList } from './types';
import { HomeScreen } from '@features/student/home';
import { ScrapScreen } from '@features/student/scrap';
import { QnaScreen } from '@features/student/qna';
import MenuNavigator from './MenuNavigator';
import MainTabBar from './components/MainTabBar';
import HomeHeader from './components/HomeHeader';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const StudentTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          headerShown: true,
          header: () => <HomeHeader />,
        }}
      />
      <Tab.Screen name='Scrap' component={ScrapScreen} />
      <Tab.Screen name='Qna' component={QnaScreen} />
      <Tab.Screen name='AllMenu' component={MenuNavigator} />
    </Tab.Navigator>
  );
};

export default StudentTabs;
