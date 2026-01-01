import { Pressable, View, Text, Image } from 'react-native';
import React, { useMemo } from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { TooltipPopover, ItemTooltipBox } from '../../Tooltip';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { useNoteStore } from '@/stores/scrapNoteStore';
import { useRecentScrapStore } from '@/stores/recentScrapStore';
import { MoveScrapModal } from '../../Modal/MoveScrapModal';
import { colors } from '@/theme/tokens';
import { ImageWithSkeleton } from '@/components/common';
import { formatToMinute } from '../../../utils/formatToMinute';
import { useScrapModal } from '../../../contexts/ScrapModalContext';

export const ScrapCard = (props: ScrapListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);
  const addScrap = useRecentScrapStore((state) => state.addScrap);
  const { openMoveScrapModal } = useScrapModal();

  // 폴더일 때 top2ScrapThumbnail 추출
  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;

  const { imageSources, isDiagonalLayout } = useMemo(() => {
    // folderTop2Thumbnail이 있으면 그것을 우선 사용 (최대 2개, 대각선 배치)
    if (folderTop2Thumbnail && folderTop2Thumbnail.length > 0) {
      return {
        imageSources: folderTop2Thumbnail.slice(0, 2).map((url) => ({ uri: url })),
        isDiagonalLayout: true,
      };
    }

    if (props.thumbnailUrl) {
      return {
        imageSources: [{ uri: props.thumbnailUrl }],
        isDiagonalLayout: false,
      };
    }

    return {
      imageSources: undefined,
      isDiagonalLayout: false,
    };
  }, [props.thumbnailUrl, folderTop2Thumbnail]);

  const cardContent = (
    <View className='w-full items-center rounded-[10px] p-[10px]'>
      <View className='gap-3'>
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
            fallback={<View className='aspect-square w-full rounded-[10px] bg-gray-600' />}
          />
          {state.isSelecting && (
            <Pressable
              onPress={props.onCheckPress}
              className={
                isSelected
                  ? 'absolute h-4 w-4 items-center justify-center rounded bg-blue-500'
                  : 'absolute h-4 w-4 items-center justify-center rounded border border-gray-700 bg-white'
              }
              style={{ bottom: 10 }}>
              <Check size={16} color='#F5F5F5' />
            </Pressable>
          )}
        </View>
        <View className='px-1'>
          <View className='flex-row justify-between'>
            <View className={'flex-[0.8] flex-row'}>
              <Text className='text-16sb  text-black' numberOfLines={2}>
                {props.name}
              </Text>
              {!state.isSelecting && (
                <View className='h-[24px] w-[24px]'>
                  <TooltipPopover
                    from={<ChevronDownFilledIcon color={colors['gray-700']} />}
                    children={(close) => (
                      <ItemTooltipBox
                        props={props}
                        onClose={close}
                        onMovePress={() => {
                          close();
                          openMoveScrapModal({
                            selectedItems: [{ id: props.id, type: props.type }],
                          });
                        }}
                      />
                    )}
                  />
                </View>
              )}
            </View>
            {props.type === 'FOLDER' && props.scrapCount !== undefined && (
              <Text className='text-12r text-blue-500'>{props.scrapCount}</Text>
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
    <>
      <Pressable
        className={`${isSelected ? 'bg-gray-300' : ''} rounded-[10px]`}
        onPress={() => {
          if (state.isSelecting) {
            props.onCheckPress?.();
            return;
          }

          if (props.type === 'FOLDER') {
            navigation.push('ScrapContent', { id: props.id });
          } else if (props.type === 'SCRAP') {
            openNote({ id: props.id, title: props.name });
            addScrap(props.id);
            navigation.push('ScrapContentDetail', { id: props.id });
          }
        }}>
        {cardContent}
      </Pressable>
    </>
  );
};
