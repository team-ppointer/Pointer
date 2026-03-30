import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGetTrash, useRestoreTrash, usePermanentDeleteTrash } from '@/apis';
import { ContentInset, LoadingScreen } from '@/components/common';
import { type StudentRootStackParamList } from '@/navigation/student/types';

import DeletedScrapHeader from '../components/Header/DeletedScrapHeader';
import { TrashScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { sortScrapData } from '../utils/formatters/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import { ConfirmationModal } from '../components/Dialog';
import { showToast } from '../components/Notification/Toast';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useScrapSelection } from '../hooks';
import { validateOnlyScrapCanMove } from '../utils/validation';
import { withScrapModals } from '../hoc';

const DeletedScrapScreenContent = () => {
  const [reducerState, dispatch] = useScrapSelection();
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  // API 호출
  const { data: trashData, isLoading } = useGetTrash();
  const { mutateAsync: restoreTrash } = useRestoreTrash();
  const { mutateAsync: permanentDelete } = usePermanentDeleteTrash();

  const trashItems = trashData?.data || [];

  const sortedData = useMemo(() => {
    const itemsWithCreatedAt = trashItems.map((item) => ({
      ...item,
      createdAt: item.deletedAt,
    }));

    return sortScrapData(itemsWithCreatedAt, sortKey, sortOrder);
  }, [trashItems, sortKey, sortOrder]);

  const handlePermanentDelete = async () => {
    const items = reducerState.selectedItems;
    try {
      await permanentDelete({
        items: items.map((item) => ({ id: item.id as number, type: item.type })),
      });
      dispatch({ type: 'CLEAR_SELECTION' });
      setIsDeleteModalVisible(false);
      showToast('success', '영구 삭제되었습니다.');
    } catch (error: unknown) {
      showToast('error', error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  };

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <DeletedScrapHeader
        navigateback={navigation}
        reducerState={reducerState}
        actions={{
          onSelectAll: () => {
            const allItems = sortedData.map((item) => ({ id: item.id, type: item.type }));
            const isAllSelected =
              reducerState.selectedItems.length === sortedData.length && sortedData.length > 0;
            dispatch({ type: 'SELECT_ALL', allItems: isAllSelected ? [] : allItems });
          },
          onEnterSelection: () => dispatch({ type: 'ENTER_SELECTION' }),
          onExitSelection: () => dispatch({ type: 'EXIT_SELECTION' }),
          onDelete: () => {
            if (reducerState.selectedItems.length > 0) {
              setIsDeleteModalVisible(true);
            }
          },
          onRestore: async () => {
            const items = reducerState.selectedItems;
            try {
              await restoreTrash({
                items: items.map((item) => ({ id: item.id as number, type: item.type })),
              });
              dispatch({ type: 'CLEAR_SELECTION' });
              showToast('success', '선택된 파일들이 복구되었습니다.');
            } catch (error: unknown) {
              showToast('error', error instanceof Error ? error.message : '복구에 실패했습니다.');
            }
          },
        }}
      />
      <View className='bg-gray-100'>
        <ContentInset className='flex-row items-center justify-between gap-[10px] py-[10px]'>
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
        </ContentInset>
        <ContentInset className='pb-[120px] pt-4'>
          {isLoading ? (
            <LoadingScreen label='데이터를 불러오고 있습니다.' />
          ) : (
            <TrashScrapGrid data={sortedData} reducerState={reducerState} dispatch={dispatch} />
          )}
        </ContentInset>
      </View>
      <ConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title={
          reducerState.selectedItems.length === 1
            ? '스크랩을 영구적으로 삭제합니다.'
            : `${reducerState.selectedItems.length}개의 스크랩을 영구적으로 삭제합니다.`
        }
        description={
          reducerState.selectedItems.length === 1
            ? '되돌릴 수 없는 작업입니다.'
            : '선택하신 스크랩이 영구적으로 삭제되며\n돌릴 수 없는 작업입니다.'
        }
        buttons={[
          { label: '취소', onPress: () => setIsDeleteModalVisible(false), variant: 'default' },
          { label: '삭제하기', onPress: handlePermanentDelete, variant: 'danger' },
        ]}
      />
    </View>
  );
};

const DeletedScrapScreen = () => {
  return <DeletedScrapScreenContent />;
};

export default DeletedScrapScreen;
