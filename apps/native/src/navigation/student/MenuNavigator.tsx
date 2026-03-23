import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '@features/student/menu/screens/MenuScreen';
import {
  MyInfoScreen,
  EditNicknameScreen,
  EditSchoolScreen,
  EditGradeScreen,
  EditScoreScreen,
  EditMathSubjectScreen,
  EditPhoneNumberScreen,
} from '@features/student/menu/screens/info';
import NotificationSettingsScreen from '@features/student/menu/screens/NotificationSettingsScreen';
import NoticeScreen from '@features/student/menu/screens/NoticeScreen';
import FeedbackScreen from '@features/student/menu/screens/FeedbackScreen';
import TermsScreen from '@features/student/menu/screens/TermsScreen';
import WithdrawalScreen from '@features/student/menu/screens/WithdrawalScreen';
import { type GradeValue, type MathSubjectValue } from '@features/student/onboarding/constants';

import { type components } from '@/types/api/schema';

export type MenuStackParamList = {
  MenuMain: undefined;
  MyInfo: {
    updatedData?: {
      name?: string;
      phoneNumber?: string;
      grade?: GradeValue;
      schoolId?: number;
      school?: components['schemas']['SchoolResp'];
      schoolName?: string;
      sido?: string;
      level?: number;
      selectSubject?: MathSubjectValue;
    };
  };
  NotificationSettings: undefined;
  Notice: undefined;
  Feedback: undefined;
  Terms: undefined;
  Withdrawal: undefined;
  EditPhoneNumber: undefined;
  EditNickname: { initialNickname?: string };
  EditGrade: { initialGrade?: GradeValue; initialSchool?: components['schemas']['SchoolResp'] };
  EditSchool: { initialSchool?: components['schemas']['SchoolResp']; initialGrade?: GradeValue };
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
        component={MyInfoScreen}
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
        name='EditPhoneNumber'
        component={EditPhoneNumberScreen}
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
        name='EditGrade'
        component={EditGradeScreen}
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
