import { Pressable, View, Text } from 'react-native';
import React, { useState } from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon, ScrapFolderDeafultIcon, ScrapScrapDefalutIcon } from '@/components/system/icons';
import { TooltipPopover, TrashItemTooltipBox } from '../../Tooltip';
import { ConfirmationModal, PopUpModal } from '../../Dialog';
import { showToast } from '../../Notification/Toast';
import { usePermanentDeleteTrash } from '@/apis';
import type { TrashListItemProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { colors } from '@/theme/tokens';
import { useCardImageSources } from '../../../hooks';

export const TrashCard = (props: TrashListItemProps) => {
  const state = props.reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, props.id, props.type);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { mutateAsync: permanentDelete } = usePermanentDeleteTrash();

  const folderTop2Thumbnail = props.type === 'FOLDER' ? props.top2ScrapThumbnail : undefined;
  const { imageSources, isDiagonalLayout } = useCardImageSources(
    props.thumbnailUrl,
    folderTop2Thumbnail
  );

  const handlePermanentDelete = async () => {
    try {
      await permanentDelete({
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
          <ScrapFolderDeafultIcon style={{ width: '100%', height: '100%' }} />
        </View>
      )  
    }
    else if (props.type === 'SCRAP') {
      return (
        <View className='aspect-square w-full overflow-hidden rounded-[10px]'>
          <ScrapScrapDefalutIcon style={{ width: '100%', height: '100%' }} />
        </View>
      )  
    }
    return <View className='aspect-square w-full rounded-[10px] bg-blue-200' />;
  };

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
            fallback={renderFallback()}
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
            <View className={'flex-[0.8] flex-row gap-0.5'}>
              <Text className='text-16sb  text-black' numberOfLines={1}>
                {props.name}
              </Text>
            </View>
            {props.type === 'FOLDER' && props.itemCount !== undefined && (
              <Text className='text-12r text-blue-500'>{props.itemCount}</Text>
            )}
          </View>
          <Text
            className={`${props.daysUntilPermanentDelete <= 3 ? 'text-red-400' : 'text-gray-700'}`}
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
            props.onCheckPress?.();
            return;
          }
        }}
        disabled={!state.isSelecting}>
        {state.isSelecting ? (
          cardContent
        ) : (
          <TooltipPopover
            from={cardContent}
            children={(close) => (
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
          />
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
