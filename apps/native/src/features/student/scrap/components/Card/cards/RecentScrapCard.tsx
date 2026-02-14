import React from 'react';
import { Pressable, View, Text, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import type { ScrapListItemResp } from '@/features/student/scrap/utils/types';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { formatToMinute } from '../../../utils/formatters/formatToMinute';

type RecentScrapCardProps = {
  scrap: ScrapListItemResp & { type: 'SCRAP' };
};

export const RecentScrapCard = ({ scrap }: RecentScrapCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Pressable
      onPress={() => {
        openNote({ id: scrap.id, title: scrap.name ?? '' });
        navigation.push('ScrapContentDetail', { id: scrap.id });
      }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
      className='bg-primary-200 h-[140px] w-[140px] flex-col items-center justify-end overflow-hidden rounded-[12px] border border-gray-300'>
      <ImageBackground
        source={{ uri: scrap.thumbnailUrl }}
        style={{ width: '100%', height: '100%' }}
        resizeMode='cover'
      />
      <View
        className={`h-[100px] w-full justify-between rounded-b-[12px] p-[10px] ${isHovered ? 'bg-gray-300' : 'bg-white'}`}>
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
