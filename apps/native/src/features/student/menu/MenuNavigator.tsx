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

import { EditNicknameScreen, EditSchoolScreen } from './screens/edits';
import { components } from '@/types/api/schema';
import EditScoreScreen from './screens/edits/EditScoreScreen';
import { MathSubjectValue } from '../onboarding/constants';
import EditMathSubjectScreen from './screens/edits/EditMathSubjectScreen';

export type MenuStackParamList = {
  MenuMain: undefined;
  MyInfo: undefined;
  PhoneNumber: undefined;
  NotificationSettings: undefined;
  Notice: undefined;
  Feedback: undefined;
  Terms: undefined;
  Withdrawal: undefined;
  EditNickname: { initialNickname?: string };
  EditSchool: { initialSchool?: components['schemas']['SchoolResp'] };
  EditScore: { initialScore?: number };
  EditMathSubject: { initialMathSubject?: MathSubjectValue };
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
      <MenuStack.Screen
        name='EditNickname'
        component={EditNicknameScreen}
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
        name='EditSchool'
        component={EditSchoolScreen}
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
        name='EditScore'
        component={EditScoreScreen}
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
        name='EditMathSubject'
        component={EditMathSubjectScreen}
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
