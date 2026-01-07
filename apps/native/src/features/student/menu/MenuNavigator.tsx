import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from './screens/MenuScreen';
import {
  MyinfoScreen,
  PhoneNumberScreen,
  NotificationSettingsScreen,
  NoticeScreen,
  FeedbackScreen,
  TermsScreen,
  WithdrawalScreen,
} from './screens/steps';

export type MenuStackParamList = {
  MenuMain: undefined;
  MyInfo: undefined;
  PhoneNumber: undefined;
  NotificationSettings: undefined;
  Notice: undefined;
  Feedback: undefined;
  Terms: undefined;
  Withdrawal: undefined;
};

const MenuStack = createNativeStackNavigator<MenuStackParamList>();

const MenuNavigator = () => {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen
        name='MenuMain'
        component={MenuScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='MyInfo'
        component={MyinfoScreen}
        options={{
          presentation: 'card',
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='PhoneNumber'
        component={PhoneNumberScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='NotificationSettings'
        component={NotificationSettingsScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='Notice'
        component={NoticeScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='Feedback'
        component={FeedbackScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='Terms'
        component={TermsScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
      <MenuStack.Screen
        name='Withdrawal'
        component={WithdrawalScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' },
            });
          },
          blur: () => {
            navigation.getParent()?.setOptions({
              tabBarStyle: undefined,
            });
          },
        })}
      />
    </MenuStack.Navigator>
  );
};

export default MenuNavigator;
