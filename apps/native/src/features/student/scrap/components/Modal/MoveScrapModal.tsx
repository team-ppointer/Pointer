import React, { useMemo, useCallback, useEffect, useReducer } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { FolderPlus } from 'lucide-react-native';

import { useGetFolders, useMoveScraps } from '@/apis';

import { PopUpModal } from '../Dialog';
import { ScrapGrid } from '../Card/ScrapCardGrid';
import { showToast } from '../Notification/Toast';
import { reducer, initialSelectionState } from '../../utils/reducer';
import { useScrapModal } from '../../contexts/ScrapModalsContext';

export const MoveScrapModal = () => {
  const {
    isMoveScrapModalVisible,
    moveScrapModalProps,
    closeMoveScrapModal,
    openCreateFolderModal,
    setRefetchFolders,
    refetchScraps,
    refetchScrapDetail,
    isCreateFolderModalVisible,
  } = useScrapModal();
  const { currentFolderId, selectedItems } = moveScrapModalProps;

  const [folderSelectionState, dispatch] = useReducer(reducer, {
    ...initialSelectionState,
    isSelecting: true, // 모달 내에서는 항상 선택 모드
  });

  const { data: foldersData, refetch: refetchFolders } = useGetFolders();
  const { mutate: moveScraps } = useMoveScraps();

  // refetchFolders를 context에 등록
  useEffect(() => {
    if (refetchFolders) {
      setRefetchFolders(refetchFolders);
    }
  }, [refetchFolders, setRefetchFolders]);

  // 모달 상태에 따른 선택 모드 관리
  useEffect(() => {
    if (isMoveScrapModalVisible) {
      // 모달이 열릴 때 선택 모드 활성화
      dispatch({ type: 'ENTER_SELECTION' });
    } else {
      // 모달이 닫힐 때 선택 상태 초기화
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  }, [isMoveScrapModalVisible]);

  // 폴더만 필터링
  const folders = useMemo(() => {
    if (!foldersData?.data) return [];

    return foldersData.data
      .filter((folder) => folder.id !== currentFolderId)
      .map((folder) => ({
        ...folder,
        type: 'FOLDER' as const,
      }));
  }, [foldersData, currentFolderId]);

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
  const handleMove = () => {
    // 선택된 폴더가 없으면 에러 (undefined는 전체 스크랩으로 이동하는 유효한 선택)
    const hasSelectedFolder = folderSelectionState.selectedItems.some(
      (item) => item.type === 'FOLDER'
    );
    if (!hasSelectedFolder) {
      showToast('error', '이동할 폴더를 선택해주세요.');
      return;
    }

    // 스크랩만 필터링 (폴더는 이동 불가)
    const scrapsToMove = selectedItems.filter(
      (item): item is { id: number; type: 'SCRAP' } => item.type === 'SCRAP'
    );
    if (scrapsToMove.length === 0) {
      showToast('error', '스크랩만 이동이 가능합니다.');
      return;
    }

    moveScraps(
      {
        scrapIds: scrapsToMove.map((item) => item.id),
        targetFolderId: selectedFolderId,
      },
      {
        onSuccess: () => {
          showToast('success', `${folderName}으로 이동 완료`);
          dispatch({ type: 'CLEAR_SELECTION' });
          refetchFolders?.();
          refetchScraps?.();
          refetchScrapDetail?.();
          closeMoveScrapModal();
        },
        onError: (error: unknown) => {
          showToast('error', error instanceof Error ? error.message : '이동에 실패했습니다.');
        },
      }
    );
  };

  const folderName =
    selectedFolderId === undefined
      ? '전체 스크랩'
      : folders.find((folder) => folder.id === selectedFolderId)?.name;

  // 폴더가 선택되었는지 확인 (전체 스크랩 포함)
  const hasSelectedFolder = folderSelectionState.selectedItems.some(
    (item) => item.type === 'FOLDER'
  );

  return (
    <PopUpModal
      visibleState={isMoveScrapModalVisible && !isCreateFolderModalVisible}
      setVisibleState={closeMoveScrapModal}
      className='px-2'>
      <View className='h-[575px] max-w-[672px] rounded-[20px] border border-gray-400 bg-white shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
        <View className='relative flex-row items-center justify-between border-b border-gray-400 px-[20px] py-[12px]'>
          <Pressable onPress={closeMoveScrapModal} className='items-start'>
            <Text className='text-14sb text-primary-600'>취소</Text>
          </Pressable>
          <View className='absolute left-0 right-0 items-center'>
            <Text className='text-16sb text-gray-900'>
              {selectedItems.length}개 스크랩 이동하기
            </Text>
          </View>
          <Pressable
            className='flex-row items-end gap-1 rounded-[6px] p-1'
            onPress={() => openCreateFolderModal()}>
            <FolderPlus size={20} color={'#3E3F45'} />
            <Text className='text-14m text-gray-800'>새로운 폴더</Text>
          </Pressable>
        </View>

        <View className='flex-1 gap-[16px] p-[20px]'>
          <ScrollView className='flex-1'>
            <ScrapGrid
              data={[{ ALL: true }, ...folders]}
              reducerState={folderSelectionState}
              dispatch={folderDispatch}
            />
          </ScrollView>
          <Pressable
            onPress={handleMove}
            className={`items-center rounded-[8px] px-[20px] py-[10px] ${
              hasSelectedFolder ? 'bg-primary-500' : 'bg-gray-300'
            }`}>
            <Text className={`text-16sb ${hasSelectedFolder ? 'text-white' : 'text-gray-500'}`}>
              {hasSelectedFolder ? `'${folderName}'으로 이동하기` : '이동할 폴더를 선택해주세요'}
            </Text>
          </Pressable>
        </View>
      </View>
    </PopUpModal>
  );
};
