import { Pressable, View, Text } from 'react-native';
import React, { useState } from 'react';
import { Check } from 'lucide-react-native';
import { TooltipPopover, TrashItemTooltipBox } from '../../Tooltip';
import type { TrashItem } from '@/features/student/scrap/utils/types';
import PopUpModal from '../../Modal/PopupModal';
import { showToast } from '../../Modal/Toast';
import { usePermanentDeleteTrash } from '@/apis';
import type { SelectableUIProps } from '../types';
import { isItemSelected } from '../../../utils/reducer';

export interface TrashCardProps extends SelectableUIProps {
  item: TrashItem;
}

export const TrashCard = ({ item, reducerState, onCheckPress }: TrashCardProps) => {
  const state = reducerState ?? { isSelecting: false, selectedItems: [] };
  const isSelected = isItemSelected(state.selectedItems, item.id, item.type);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { mutateAsync: permanentDelete } = usePermanentDeleteTrash();

  const cardContent = (
    <View className='h-full w-full items-center gap-3 rounded-[10px] p-[10px]'>
      <View className='max-h-[70%] w-full'>
        <View className='h-full w-full rounded-[10px] bg-gray-600' />
      </View>
      {state.isSelecting && (
        <Pressable
          onPress={onCheckPress}
          className={
            isSelected
              ? 'absolute h-4 w-4 items-center justify-center rounded bg-blue-500'
              : 'absolute h-4 w-4 items-center justify-center rounded border border-gray-700 bg-white'
          }
          style={{ left: 20, top: 50 }}>
          <Check size={16} color='#F5F5F5' />
        </Pressable>
      )}

      <View className='w-full px-[6px]'>
        <Text className='text-16sb text-[#1E1E21]' numberOfLines={2}>
          {item.name}
        </Text>
        <Text className='text-12m text-gray-700'>{item.daysUntilPermanentDelete}일 남음</Text>
      </View>
    </View>
  );

  return (
    <>
      {state.isSelecting ? (
        <Pressable onPress={onCheckPress}>{cardContent}</Pressable>
      ) : (
        <TooltipPopover
          from={cardContent}
          children={(close) => (
            <TrashItemTooltipBox
              item={item}
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
                        id: Number(item.id),
                        type: item.type as 'FOLDER' | 'SCRAP',
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
