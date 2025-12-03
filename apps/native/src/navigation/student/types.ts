import type { NavigatorScreenParams } from '@react-navigation/native';

export type StudentTabParamList = {
  Home: undefined;
  Scrap: undefined;
  Qna: undefined;
  AllMenu: undefined;
};

export type StudentRootStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList>;
  Notifications: undefined;
  NotificationDetail: undefined;
  Problem: undefined;
  Pointing: undefined;
  Analysis: undefined;
};
