import { Pressable, View, Text } from 'react-native';
import React, { useState } from 'react';
import { Check } from 'lucide-react-native';
import { ChevronDownFilledIcon } from '@/components/system/icons';
import { TooltipPopover, TrashItemTooltipBox } from '../../Tooltip';
import { PopUpModal } from '../../Dialog';
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

  const cardContent = (
    <View className={`w-full items-center rounded-[10px] p-[10px] ${isSelected && 'bg-gray-300'}`}>
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
            <View className={'flex-[0.8] flex-row gap-0.5'}>
              <Text className='text-16sb  text-black' numberOfLines={1}>
                {props.name}
              </Text>
              {!state.isSelecting && (
                <View className='h-[24px] w-[24px]'>
                  <TooltipPopover
                    from={<ChevronDownFilledIcon color={colors['gray-700']} />}
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
                </View>
              )}
            </View>
            {props.type === 'FOLDER' && props.itemCount !== undefined && (
              <Text className='text-12r text-blue-500'>{props.itemCount}</Text>
            )}
          </View>
          <Text className='text-10r text-gray-700' numberOfLines={1}>
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
          // TrashCard는 클릭 시 아무 동작도 하지 않음
        }}>
        {cardContent}
      </Pressable>
      <PopUpModal
        visibleState={isDeleteModalVisible}
        setVisibleState={setIsDeleteModalVisible}
        className='px-[60px] py-[65px]'>
        <View className='w-[458px] max-w-[600px] items-center justify-center gap-[24px] rounded-[12px] border border-[#DFE2E7] bg-white p-[28px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
          <View className='items-center gap-[12px]'>
            <Text className='text-18b text-[#1E1E1E]'>스크랩을 영구적으로 삭제합니다.</Text>
            <Text className='text-16m text-[#1E1E1E]'>되돌릴 수 없는 작업입니다.</Text>
          </View>
          <View className='flex-row gap-[6px]'>
            <Pressable
              className='flex-1 items-center justify-center rounded-[12px] border border-gray-500 bg-gray-300 py-[12px]'
              onPress={() => setIsDeleteModalVisible(false)}>
              <Text className='text-18m text-[#1E1E21]'>취소</Text>
            </Pressable>
            <Pressable
              className='flex-1 items-center justify-center rounded-[12px] border border-gray-500 bg-red-400 py-[12px]'
              onPress={async () => {
                try {
                  await permanentDelete({
                    items: [
                      {
                        id: Number(props.id),
                        type: props.type as 'FOLDER' | 'SCRAP',
                      },
                    ],
                  } as any);
                  setIsDeleteModalVisible(false);
                  showToast('success', '영구 삭제되었습니다.');
                } catch (error) {
                  showToast('error', '삭제 중 오류가 발생했습니다.');
                }
              }}>
              <Text className='text-18m text-white'>삭제하기</Text>
            </Pressable>
          </View>
        </View>
      </PopUpModal>
    </>
  );
};
