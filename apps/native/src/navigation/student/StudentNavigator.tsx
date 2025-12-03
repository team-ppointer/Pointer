import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationScreen from '@features/student/home/screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '@features/student/home/screens/notifications/NotificationDetailScreen';
import { ProblemScreen, PointingScreen, AnalysisScreen } from '@features/student/problem';
import StudentTabs from './StudentTabs';
import { StudentRootStackParamList } from './types';
import NotificationHeader from './components/NotificationHeader';

const StudentRootStack = createNativeStackNavigator<StudentRootStackParamList>();

const StudentNavigator = () => {
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
    </StudentRootStack.Navigator>
  );
};

export default StudentNavigator;
