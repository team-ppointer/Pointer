import { View, Text, ScrollView } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import ProblemViewer from '@features/student/problem/components/ProblemViewer';
import { Container } from '@components/common';
import { type StudentRootStackParamList } from '@navigation/student/types';

type Props = NativeStackScreenProps<StudentRootStackParamList, 'NotificationDetail'>;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const NotificationDetailScreen = ({ route }: Props) => {
  const { title, date, content } = route.params;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View className='mx-auto w-full'>
        <Container className='gap-[32px] pt-[16px]'>
          <View className='flex-col gap-0.5'>
            <Text className='text-20b text-gray-900'>{title}</Text>
            <Text className='text-12m text-gray-700'>{formatDate(date)}</Text>
          </View>
          <ProblemViewer problemContent={content} minHeight={200} />
        </Container>
      </View>
    </ScrollView>
  );
};

export default NotificationDetailScreen;
