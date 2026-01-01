import React from 'react';
import { Pressable, View, Text, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import type { ScrapDetailResp } from '@/features/student/scrap/utils/types';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { useRecentScrapStore } from '@/stores/recentScrapStore';
import { formatToMinute } from '../../../utils/formatToMinute';

type RecentScrapCardProps = {
  scrap: ScrapDetailResp & { type: 'SCRAP' };
};

export const RecentScrapCard = ({ scrap }: RecentScrapCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);
  const addScrap = useRecentScrapStore((state) => state.addScrap);

  return (
    <Pressable
      onPress={() => {
        openNote({ id: scrap.id, title: scrap.name ?? '' });
        addScrap(scrap.id);
        navigation.push('ScrapContentDetail', { id: scrap.id });
      }}
      className='bg-primary-200 h-[140px] w-[140px] flex-col items-center justify-end rounded-[12px] border border-gray-300'>
      <ImageBackground
        source={{ uri: scrap.thumbnailUrl }}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
        resizeMode='cover'
      />
      <View className='h-[100px] w-full justify-between rounded-b-[12px] bg-white p-[10px]'>
        <Text className='text-16sb text-black' numberOfLines={2}>
          {scrap.name}
        </Text>
        <Text className='text-12r text-gray-700 ' numberOfLines={1}>
          {formatToMinute(new Date(scrap.updatedAt))}
        </Text>
      </View>
    </Pressable>
  );
};
