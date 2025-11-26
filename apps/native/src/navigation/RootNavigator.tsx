import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import StudentNavigator from './student/StudentNavigator';

export type RootStackParamList = {
  StudentNavigator: undefined;
};

const NativeStack = createNativeStackNavigator<RootStackParamList>();
const WebStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  if (Platform.OS === 'web') {
    return (
      <WebStack.Navigator screenOptions={{ headerShown: false }}>
        <WebStack.Screen name='StudentNavigator' component={StudentNavigator} />
      </WebStack.Navigator>
    );
  }

  return (
    <NativeStack.Navigator screenOptions={{ headerShown: false }}>
      <NativeStack.Screen name='StudentNavigator' component={StudentNavigator} />
    </NativeStack.Navigator>
  );
};

export default RootNavigator;
