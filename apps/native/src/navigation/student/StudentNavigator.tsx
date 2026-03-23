import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationScreen from '@features/student/home/screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '@features/student/home/screens/notifications/NotificationDetailScreen';
import {
  ProblemScreen,
  PointingScreen,
  AnalysisScreen,
  AllPointingsScreen,
} from '@features/student/problem';
import { ChatRoomScreen, SearchScreen } from '@features/student/qna';
import { DeletedScrapScreen, ScrapScreen, SearchScrapScreen } from '@/features/student/scrap';
import FolderScrapScreen from '@/features/student/scrap/screens/FolderScrapScreen';
import ScrapDetailScreen from '@/features/student/scrap/screens/ScrapDetailScreen';
import { useOnboardingStore } from '@/features/student/onboarding/store/useOnboardingStore';
import { useAuthStore } from '@/stores';
import OnboardingScreen from '@/features/student/onboarding/screens/OnboardingScreen';
import { useFcmToken } from '@/hooks';
import { AnalyticsProvider, useScreenTracking } from '@/features/student/analytics';

import StudentTabs from './StudentTabs';
import { type StudentRootStackParamList } from './types';
import NotificationHeader from './components/NotificationHeader';

const StudentRootStack = createNativeStackNavigator<StudentRootStackParamList>();

/**
 * Inner navigator component that uses screen tracking
 * Must be inside AnalyticsProvider
 */
const StudentNavigatorContent = () => {
  // Track screen navigation for analytics
  useScreenTracking();

  return (
    <StudentRootStack.Navigator screenOptions={{ headerShown: false }}>
      <StudentRootStack.Screen name='StudentTabs' component={StudentTabs} />
      <StudentRootStack.Screen
        name='Notifications'
        component={NotificationScreen}
        options={{
          headerShown: true,
          header: (props) => <NotificationHeader title='알림' {...props} />,
        }}
      />
      <StudentRootStack.Screen
        name='NotificationDetail'
        component={NotificationDetailScreen}
        options={{
          headerShown: true,
          header: (props) => <NotificationHeader title='공지' {...props} />,
        }}
      />
      <StudentRootStack.Screen name='Problem' component={ProblemScreen} />
      <StudentRootStack.Screen name='Pointing' component={PointingScreen} />
      <StudentRootStack.Screen name='Analysis' component={AnalysisScreen} />
      <StudentRootStack.Screen name='AllPointings' component={AllPointingsScreen} />
      <StudentRootStack.Screen name='ChatRoom' component={ChatRoomScreen} />
      <StudentRootStack.Screen name='QnaSearch' component={SearchScreen} />
      <StudentRootStack.Screen name='Scrap' component={ScrapScreen} />
      <StudentRootStack.Screen name='ScrapContent' component={FolderScrapScreen} />
      <StudentRootStack.Screen name='DeletedScrap' component={DeletedScrapScreen} />
      <StudentRootStack.Screen name='SearchScrap' component={SearchScrapScreen} />
      <StudentRootStack.Screen name='ScrapContentDetail' component={ScrapDetailScreen} />
    </StudentRootStack.Navigator>
  );
};

const StudentNavigator = () => {
  const onboardingStatus = useOnboardingStore((state) => state.status);
  const studentGrade = useAuthStore((state) => state.studentProfile?.grade);

  // FCM 토큰 등록 (학생 화면 진입 시 자동으로 등록/갱신)
  useFcmToken();

  const shouldShowOnboarding =
    onboardingStatus === 'in-progress' || (!studentGrade && onboardingStatus !== 'completed');

  if (shouldShowOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <AnalyticsProvider>
      <StudentNavigatorContent />
    </AnalyticsProvider>
  );
};

export default StudentNavigator;
