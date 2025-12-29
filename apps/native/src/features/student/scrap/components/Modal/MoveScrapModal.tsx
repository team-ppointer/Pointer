import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { FolderPlus } from 'lucide-react-native';
import PopUpModal from './PopupModal';
import { ScrapGrid } from '../Card/ScrapCardGrid';
import { useGetFolders, useMoveScraps } from '@/apis';
import { showToast } from './Toast';
import { reducer, initialSelectionState } from '../../utils/reducer';
import { useReducer } from 'react';
import type { SelectedItem } from '../../utils/reducer';
import { CreateFolderModal } from './CreateFolderModal';

interface MoveScrapModalProps {
  currentFolderId?: number;
  visible: boolean;
  onClose: () => void;
  selectedItems: SelectedItem[];
  onSuccess?: () => void;
}

export const MoveScrapModal = ({
  currentFolderId,
  visible,
  onClose,
  selectedItems,
  onSuccess,
}: MoveScrapModalProps) => {
  const [folderSelectionState, dispatch] = useReducer(reducer, {
    ...initialSelectionState,
    isSelecting: true, // 모달 내에서는 항상 선택 모드
  });

  const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
  const { data: foldersData, refetch: refetchFolders } = useGetFolders();
  const { mutateAsync: moveScraps } = useMoveScraps();

  // 모달 상태에 따른 선택 모드 관리
  useEffect(() => {
    if (visible) {
      // 모달이 열릴 때 선택 모드 활성화
      dispatch({ type: 'ENTER_SELECTION' });
    } else {
      // 모달이 닫힐 때 선택 상태 초기화
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  }, [visible]);

  // 폴더만 필터링
  const folders = useMemo(() => {
    if (!foldersData?.data) return [];

    return foldersData.data
      .filter((folder) => folder.id !== currentFolderId)
      .map((folder) => ({
        ...folder,
        type: 'FOLDER' as const,
      }));
  }, [foldersData]);

  // 선택된 폴더 ID (폴더는 하나만 선택 가능)
  const selectedFolderId = folderSelectionState.selectedItems.find(
    (item) => item.type === 'FOLDER'
  )?.id;

  // 폴더 선택을 위한 커스텀 dispatch (하나만 선택 가능)
  const folderDispatch = React.useCallback(
    (action: Parameters<typeof dispatch>[0]) => {
      if (action.type === 'SELECTING_ITEM' && action.itemType === 'FOLDER') {
        const isSelected = folderSelectionState.selectedItems.some(
          (item) => item.id === action.id && item.type === 'FOLDER'
        );
        if (isSelected) {
          // 선택 해제
          dispatch(action);
        } else {
          // 다른 폴더 선택 해제 후 새로 선택
          const otherFolders = folderSelectionState.selectedItems.filter(
            (item) => item.type === 'FOLDER'
          );
          otherFolders.forEach((item) => {
            dispatch({ type: 'SELECTING_ITEM', id: item.id, itemType: 'FOLDER' });
          });
          dispatch(action);
        }
      } else {
        dispatch(action);
      }
    },
    [folderSelectionState.selectedItems]
  );

  // 이동 실행
  const handleMove = async () => {
    if (!selectedFolderId) {
      showToast('error', '이동할 폴더를 선택해주세요.');
      return;
    }

    // 스크랩만 필터링 (폴더는 이동 불가)
    const scrapsToMove = selectedItems.filter((item) => item.type === 'SCRAP');
    if (scrapsToMove.length === 0) {
      showToast('error', '스크랩만 이동이 가능합니다.');
      return;
    }

    try {
      await moveScraps({
        scrapIds: scrapsToMove.map((item) => item.id),
        targetFolderId: selectedFolderId,
      });

      showToast('success', `${scrapsToMove.length}개의 스크랩이 이동되었습니다.`);
      dispatch({ type: 'CLEAR_SELECTION' });
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast('error', '이동 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <PopUpModal visibleState={visible} setVisibleState={onClose}>
        <View className='h-[575px] min-w-[520px] max-w-[692px] rounded-[20px] border border-gray-400 bg-white shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
          <View className='flex-row items-center justify-between border-b border-gray-400 px-[20px] py-[12px]'>
            <View className='w-[80px]' />
            <Text className='text-16sb text-gray-900'>스크랩 이동하기</Text>
            <Pressable
              className='flex-row gap-1 rounded-[6px] p-1'
              onPress={() => setIsCreateFolderModalVisible(true)}>
              <FolderPlus size={20} color={'#3E3F45'} />
              <Text className='text-14m text-gray-800'>새로운 폴더</Text>
            </Pressable>
          </View>

          <View className='gap-[18px] p-[20px]'>
            <View className='gap-[10px]  p-[10px]'>
              <ScrapGrid
                data={folders}
                reducerState={folderSelectionState}
                dispatch={folderDispatch}
              />
              <Pressable
                onPress={handleMove}
                className={`items-center rounded-[8px] px-[20px] py-[10px] ${
                  selectedFolderId ? 'bg-primary-500' : 'bg-gray-300'
                }`}>
                <Text className={`text-16sb ${selectedFolderId ? 'text-white' : 'text-gray-500'}`}>
                  {selectedFolderId ? '스크랩 이동하기' : '이동할 폴더를 선택해주세요'}
                </Text>
              </Pressable>
            </View>
          </View>
          <CreateFolderModal
            visible={isCreateFolderModalVisible}
            onClose={() => setIsCreateFolderModalVisible(false)}
            onSuccess={() => {}}
          />
        </View>
      </PopUpModal>
    </>
  );
};
