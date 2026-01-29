import { Pressable, View, Text, Image } from 'react-native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useGetFolderDetail } from '@/apis';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { ScrapListItemProps } from '../types';
import { useCardImageSources } from '../../../hooks';
import { formatToMinute } from '../../../utils/formatters/formatToMinute';
import { HighlightedText } from '../../../utils/HighlightedText';
import { ScrapDefaultIcon, ScrapFolderDefaultIcon } from '@/components/system/icons';

type SearchResultCardProps = ScrapListItemProps & {
  searchQuery?: string;
};

export const SearchResultCard = (props: SearchResultCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);

  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;
  const { imageSources, isDiagonalLayout } = useCardImageSources(
    props.thumbnailUrl,
    folderTop2Thumbnail
  );

  const renderFallback = () => {
    if (props.type === 'FOLDER') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapFolderDefaultIcon style={{ width: '100%', height: '100%' }} />
        </View>
      );
    } else if (props.type === 'SCRAP') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapDefaultIcon style={{ width: '100%', height: '100%' }} />
        </View>
      );
    }
    return <View className='aspect-square w-full rounded-[10px] bg-blue-200' />;
  };

  const cardContent = (
    <View className='h-full w-full items-center rounded-[10px] p-[10px]'>
      <View className='w-full gap-3'>
        <View className='items-center'>
          <ImageWithSkeleton
            key={`${props.type}-${props.id}`}
            source={imageSources}
            width='100%'
            aspectRatio={1}
            borderRadius={10}
            resizeMode='cover'
            uniqueId={`${props.type}-${props.id}`}
            isDiagonalLayout={isDiagonalLayout}
            fallback={renderFallback()}
          />
        </View>
        <View className='w-full justify-between px-1'>
          <View className='flex-row  gap-0.5'>
            <HighlightedText
              text={props.name}
              query={props.searchQuery || ''}
              className='text-16sb flex-1 text-[#1E1E21]'
              highlightClassName='text-[#007AFF]'
              numberOfLines={2}
            />
            {props.type === 'FOLDER' && (
              <Text className='text-12m text-blue-500'>{props.scrapCount}</Text>
            )}
          </View>

          <Text className='text-10r text-gray-700' numberOfLines={1}>
            {props.updatedAt
              ? formatToMinute(new Date(props.updatedAt))
              : formatToMinute(new Date(props.createdAt))}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={() => {
        if (props.type === 'FOLDER') {
          navigation.push('ScrapContent', { id: props.id });
        } else if (props.type === 'SCRAP') {
          openNote({ id: props.id, title: props.name });
          navigation.push('ScrapContentDetail', { id: props.id });
        }
      }}>
      {cardContent}
    </Pressable>
  );
};
