import type { NavigatorScreenParams } from '@react-navigation/native';
import { components } from '@schema';

type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];

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
  AllPointings: {
    group: PublishProblemGroupResp;
    publishAt?: string;
    problemSetTitle?: string;
  };
  Scrap: undefined;
  ScrapContent: {
    id: string;
  };
  SearchScrap: undefined;
  DeletedScrap: undefined;
};

