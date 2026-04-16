import { View, Text, ScrollView } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import { ContentInset, PointerContentView } from '@components/common';
import { buildDocumentInit } from '@features/student/problem/transforms/contentRendererTransforms';
import { type StudentRootStackParamList } from '@navigation/student/types';
import { colors } from '@theme/tokens';

type Props = NativeStackScreenProps<StudentRootStackParamList, 'NotificationDetail'>;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const NotificationDetailScreen = ({ route }: Props) => {
  const { title, date, content } = route.params;

  const initMessage = useMemo(
    () =>
      buildDocumentInit({ content, fontStyle: 'sans-serif', backgroundColor: colors['gray-100'] }),
    [content]
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View className='mx-auto w-full'>
        <ContentInset className='gap-[32px] pt-[20px]'>
          <View className='flex-col'>
            <Text className='typo-title-2-bold text-gray-900'>{title}</Text>
            <Text className='typo-label-medium text-gray-700'>{formatDate(date)}</Text>
          </View>
          <PointerContentView initMessage={initMessage} minHeight={200} />
        </ContentInset>
      </View>
    </ScrollView>
  );
};

export default NotificationDetailScreen;
