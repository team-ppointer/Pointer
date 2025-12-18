import React, { useMemo, useReducer, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DeletedScrapHeader from '../components/Header/DeletedHeader';
import { reducer, initialSelectionState } from '../utils/reducer';
import { useNavigation } from '@react-navigation/native';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Container, LoadingScreen } from '@/components/common';
import { TrashScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Modal/SortDropdown';
import { sortScrapData } from '../utils/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import PopUpModal from '../components/Modal/PopupModal';
import { showToast } from '../components/Modal/Toast';
import { useGetTrash, useRestoreTrash, usePermanentDeleteTrash } from '@/apis';

const DeletedScrapScreen = () => {
  const [reducerState, dispatch] = useReducer(reducer, initialSelectionState);
  const [sortKey, setSortKey] = useState<UISortKey>('TYPE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  // API 호출
  const { data: trashData, isLoading } = useGetTrash();
  const { mutateAsync: restoreTrash } = useRestoreTrash();
  const { mutateAsync: permanentDelete } = usePermanentDeleteTrash();

  const trashItems = trashData?.data || [];

  /**
   * 휴지통 아이템 정렬
   * API의 TrashItemResp는 createdAt이 없으므로 deletedAt을 createdAt으로 사용
   */
  const sortedData = useMemo(() => {
    const itemsWithCreatedAt = trashItems.map((item) => ({
      ...item,
      createdAt: item.deletedAt,
    }));

    return sortScrapData(itemsWithCreatedAt, sortKey, sortOrder);
  }, [trashItems, sortKey, sortOrder]);

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <DeletedScrapHeader
        navigateback={navigation}
        reducerState={reducerState}
        onSelectAll={() => {
          const allIds = sortedData.map((item) => item.id);
          const isAllSelected =
            reducerState.selectedItems.length === sortedData.length && sortedData.length > 0;
          dispatch({ type: 'SELECT_ALL', allIds: isAllSelected ? [] : allIds });
        }}
        onEnterSelection={() => dispatch({ type: 'ENTER_SELECTION' })}
        onExitSelection={() => dispatch({ type: 'EXIT_SELECTION' })}
        onDelete={() => {
          if (reducerState.selectedItems.length > 0) {
            setIsDeleteModalVisible(true);
          }
        }}
        onRestore={async () => {
          try {
            const items = reducerState.selectedItems.map((id) => {
              const item = trashItems.find((item) => item.id === id);
              return {
                id,
                type: item?.type || ('SCRAP' as const),
              };
            });

            await restoreTrash({ items });
            dispatch({ type: 'CLEAR_SELECTION' });
            showToast('success', '선택된 파일들이 복구되었습니다.');
          } catch (error) {
            showToast('error', '복구 중 오류가 발생했습니다.');
          }
        }}
      />
      <View className='bg-gray-100'>
        <Container className='flex-row items-center justify-between gap-[10px] py-[10px]'>
          <Text className='text-14r text-gray-600'>
            휴지통의 스크랩은 30일 이후에 영구적으로 삭제됩니다.
          </Text>
          <SortDropdown
            ordertype={'LIST'}
            orderValue={sortKey}
            setOrderValue={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </Container>
        <Container className='pb-[120px] pt-4'>
          {isLoading ? (
            <LoadingScreen label='데이터를 불러오고 있습니다.' />
          ) : (
            <TrashScrapGrid data={sortedData} reducerState={reducerState} dispatch={dispatch} />
          )}
        </Container>
      </View>
      <PopUpModal
        visibleState={isDeleteModalVisible}
        setVisibleState={setIsDeleteModalVisible}
        className='px-[60px] py-[65px]'>
        <View className='w-[458px] max-w-[600px] items-center justify-center gap-[24px] rounded-[12px] border border-[#DFE2E7] bg-white p-[28px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
          <View className='items-center gap-[12px]'>
            <Text className='text-18b text-[#1E1E1E]'>
              {reducerState.selectedItems.length === 1
                ? '스크랩을 영구적으로 삭제합니다.'
                : `${reducerState.selectedItems.length}개의 스크랩을 영구적으로 삭제합니다.`}
            </Text>
            <Text className='text-16m text-center text-[#1E1E1E]'>
              {reducerState.selectedItems.length === 1
                ? '되돌릴 수 없는 작업입니다.'
                : '선택하신 스크랩이 영구적으로 삭제되며\n돌릴 수 없는 작업입니다.'}
            </Text>
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
                  const items = reducerState.selectedItems.map((id) => {
                    const item = trashItems.find((item) => item.id === id);
                    return {
                      id,
                      type: item?.type || ('SCRAP' as const),
                    };
                  });

                  await permanentDelete({ items });
                  dispatch({ type: 'CLEAR_SELECTION' });
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
    </View>
  );
};

export default DeletedScrapScreen;
