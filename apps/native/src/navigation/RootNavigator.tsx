import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import StudentNavigator from './student/StudentNavigator';
import NotificationsScreen from '@/features/student/home/screens/NotificationsScreen';

export type RootStackParamList = {
  StudentNavigator: undefined;
  Notifications: undefined;
};

const NativeStack = createNativeStackNavigator<RootStackParamList>();
const WebStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  if (Platform.OS === 'web') {
    return (
      <WebStack.Navigator screenOptions={{ headerShown: false }}>
        <WebStack.Screen name='StudentNavigator' component={StudentNavigator} />
        <WebStack.Screen name='Notifications' component={NotificationsScreen} />
      </WebStack.Navigator>
    );
  }

  return (
    <NativeStack.Navigator screenOptions={{ headerShown: false }}>
      <NativeStack.Screen name='StudentNavigator' component={StudentNavigator} />
      <NativeStack.Screen name='Notifications' component={NotificationsScreen} />
    </NativeStack.Navigator>
  );
};

export default RootNavigator;
