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
  NotificationDetail: {
    noticeId: number;
    title: string;
    date: string;
    content: string;
  };
  Problem: undefined;
  Pointing: undefined;
  Analysis: undefined;
  AllPointings: {
    group: PublishProblemGroupResp;
    publishAt?: string;
    problemSetTitle?: string;
  };
  // QnA screens
  ChatRoom: {
    chatRoomId: number;
    isAdminChat?: boolean;
  };
  QnaSearch: undefined;
  Scrap: undefined;
  ScrapContent: {
    id: number;
  };
  SearchScrap: undefined;
  DeletedScrap: undefined;
  ScrapContentDetail: {
    id: number;
  };
};
