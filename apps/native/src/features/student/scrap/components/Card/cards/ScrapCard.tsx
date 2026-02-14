import { Pressable, View, Text, Image } from 'react-native';
import React from 'react';
import { Check } from 'lucide-react-native';
import {
  ChevronDownFilledIcon,
  ScrapDefaultIcon,
  ScrapFolderDefaultIcon,
} from '@/components/system/icons';
import { TooltipPopover, ItemTooltipBox } from '../../Tooltip';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ScrapListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { useNoteStore } from '@/features/student/scrap/stores/scrapNoteStore';
import { colors } from '@/theme/tokens';
import { ImageWithSkeleton } from '@/components/common';
import { formatToMinute } from '../../../utils/formatters/formatToMinute';
import { useScrapModal } from '../../../contexts/ScrapModalsContext';
import { useCardImageSources } from '../../../hooks';

export const ScrapCard = (props: ScrapListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const openNote = useNoteStore((state) => state.openNote);
  const { openMoveScrapModal } = useScrapModal();

  const folderId = props.type === 'SCRAP' ? props.folderId : undefined;

  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;
  const { imageSources, isDiagonalLayout } = useCardImageSources(
    props.thumbnailUrl,
    folderTop2Thumbnail
  );

  const renderFallback = () => {
    if (props.type === 'FOLDER') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapFolderDefaultIcon
            isHovered={isSelected}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </View>
      );
    } else if (props.type === 'SCRAP') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapDefaultIcon
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </View>
      );
    }
    return <View className='aspect-square w-full rounded-[10px] bg-blue-200' />;
  };

  const cardContent = (
    <View className='w-full flex-col items-center gap-3 rounded-[10px]'>
      <ImageWithSkeleton
        isHovered={isSelected}
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
      {state.isSelecting && (
        <Pressable
          onPress={props.onCheckPress}
          className={
            isSelected
              ? 'absolute h-[18px] w-[18px] items-center justify-center rounded bg-blue-500'
              : 'absolute h-[18px] w-[18px] items-center justify-center rounded border border-gray-700 bg-white'
          }
          style={{ top: 108 }}>
          {isSelected && <Check size={16} color='#F5F5F5' />}
        </Pressable>
      )}
      <View className='w-full flex-col items-start gap-[2px]'>
        <View className='w-full flex-row items-center justify-between gap-[2px]'>
          <View
            className={`min-w-0 flex-1 shrink flex-row items-center ${props.type === 'FOLDER' ? 'gap-[2px]' : 'justify-between gap-[2px]'}`}>
            <Text className='text-16sb shrink text-black' numberOfLines={2}>
              {props.name}
            </Text>
            {!state.isSelecting && (
              <View className='shrink-0'>
                <TooltipPopover
                  from={<ChevronDownFilledIcon size={22} color={colors['gray-700']} />}
                  triggerBorderRadius={4}
                  children={(close) => (
                    <ItemTooltipBox
                      props={props}
                      onClose={close}
                      onMovePress={() => {
                        close();
                        openMoveScrapModal({
                          currentFolderId: folderId,
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
            <Text className='text-12r shrink-0 text-blue-500'>{props.scrapCount}</Text>
          )}
        </View>
        <Text className='text-12r text-gray-700' numberOfLines={1}>
          {props.updatedAt
            ? formatToMinute(new Date(props.updatedAt))
            : formatToMinute(new Date(props.createdAt))}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Pressable
        className={`${isSelected ? 'bg-gray-300' : ''} rounded-[10px] p-[10px]`}
        onPress={() => {
          if (state.isSelecting) {
            props.onCheckPress?.();
            return;
          }

          if (props.type === 'FOLDER') {
            navigation.push('ScrapContent', { id: props.id });
          } else if (props.type === 'SCRAP') {
            openNote({ id: props.id, title: props.name });
            navigation.push('ScrapContentDetail', { id: props.id });
          }
        }}>
        {cardContent}
      </Pressable>
    </>
  );
};
