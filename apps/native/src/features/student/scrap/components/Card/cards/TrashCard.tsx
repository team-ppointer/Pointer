import { Pressable, View, Text } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Check } from 'lucide-react-native';

import {
  ChevronDownFilledIcon,
  ScrapDefaultIcon,
  ScrapFolderDefaultIcon,
} from '@/components/system/icons';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { colors } from '@/theme/tokens';

import { TooltipPopover, TrashItemTooltipBox } from '../../Tooltip';
import { ConfirmationModal, PopUpModal } from '../../Dialog';
import { showToast } from '../../Notification/Toast';
import type { TrashListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { useCardImageSources } from '../../../hooks';

type TrashCardExtraProps = {
  onPermanentDelete?: (params: {
    items: { id: number; type: 'FOLDER' | 'SCRAP' }[];
  }) => Promise<unknown>;
};

export const TrashCard = (props: TrashListItemProps & TrashCardExtraProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleCheckPress = useCallback(() => {
    props.dispatch?.({
      type: 'SELECTING_ITEM',
      id: props.id,
      itemType: props.type,
    });
  }, [props.dispatch, props.id, props.type]);

  const shouldShowHover = state.isSelecting ? isSelected : isTooltipOpen;

  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;
  const { imageSources, isDiagonalLayout } = useCardImageSources(
    props.thumbnailUrl,
    folderTop2Thumbnail
  );

  const handlePermanentDelete = async () => {
    if (!props.onPermanentDelete) return;
    try {
      await props.onPermanentDelete({
        items: [{ id: Number(props.id), type: props.type as 'FOLDER' | 'SCRAP' }],
      });
      setIsDeleteModalVisible(false);
      showToast('success', '영구 삭제되었습니다.');
    } catch (error) {
      showToast('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  const renderFallback = () => {
    if (props.type === 'FOLDER') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapFolderDefaultIcon
            isHovered={shouldShowHover}
            style={{ width: '100%', height: '100%' }}
          />
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

  const cardContent = () => (
    <View className='w-full items-center rounded-[10px] p-[10px]'>
      <View className='gap-3'>
        <View className='items-center'>
          <ImageWithSkeleton
            isHovered={shouldShowHover}
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
              onPress={handleCheckPress}
              className={
                isSelected
                  ? 'absolute h-[18px] w-[18px] items-center justify-center rounded bg-blue-500'
                  : 'absolute h-[18px] w-[18px] items-center justify-center rounded border border-gray-700 bg-white'
              }
              style={{ top: 108 }}>
              {isSelected && <Check size={16} color='#F5F5F5' />}
            </Pressable>
          )}
        </View>

        <View className='w-full flex-col items-start gap-[2px]'>
          <View className='flex-row items-center gap-[2px]'>
            <View className={'min-w-0 flex-1 shrink flex-row items-center'}>
              <Text className='text-16sb shrink text-black' numberOfLines={2}>
                {props.name}
              </Text>
            </View>
            {props.type === 'FOLDER' && props.itemCount !== undefined && (
              <Text className='text-12r text-blue-500'>{props.itemCount}</Text>
            )}
          </View>
          <Text
            className={`${props.daysUntilPermanentDelete <= 3 ? 'text-red-400' : 'text-gray-700'} text-12r`}
            numberOfLines={1}>
            {props.daysUntilPermanentDelete}일 남음
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
            handleCheckPress();
            return;
          }
        }}
        disabled={!state.isSelecting}>
        {state.isSelecting ? (
          cardContent()
        ) : (
          <TooltipPopover from={cardContent()} onOpenChange={setIsTooltipOpen}>
            {(close) => (
              <TrashItemTooltipBox
                item={props}
                onClose={close}
                onDeletePress={() => {
                  close();
                  setTimeout(() => {
                    setIsDeleteModalVisible(true);
                  }, 200);
                }}
              />
            )}
          </TooltipPopover>
        )}
      </Pressable>
      <ConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title='스크랩을 영구적으로 삭제합니다.'
        description='되돌릴 수 없는 작업입니다.'
        buttons={[
          { label: '취소', onPress: () => setIsDeleteModalVisible(false), variant: 'default' },
          {
            label: '삭제하기',
            onPress: handlePermanentDelete,
            variant: 'danger',
          },
        ]}
      />
    </>
  );
};
