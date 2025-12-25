import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useReducer, useState } from 'react';
import { View } from 'react-native';
import { reducer, initialSelectionState } from '../utils/reducer';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Modal/SortDropdown';
import { sortScrapData, mapUIKeyToAPIKey } from '../utils/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import { showToast } from '../components/Modal/Toast';
import { useSearchScraps, useDeleteScrap } from '@/apis';
import { MoveScrapModal } from '../components/Modal/MoveScrapModal';

const ScrapScreen = () => {
  const [reducerState, dispatch] = useReducer(reducer, initialSelectionState);
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const {
    data: searchData,
    isLoading,
    refetch,
  } = useSearchScraps({
    sort: mapUIKeyToAPIKey(sortKey),
    order: sortOrder,
  });
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // ScrapSearchResp는 folders와 scraps를 각각 반환하므로 합쳐야 함
  const data = useMemo(() => {
    if (!searchData) return [];
    const folders = (searchData.folders || []).map((folder) => ({
      type: 'FOLDER' as const,
      id: folder.id,
      name: folder.name,
      scrapCount: folder.scrapCount,
      createdAt: folder.createdAt,
    }));
    const scraps = (searchData.scraps || []).filter((scrap) => scrap.folderId == null);
    return [...folders, ...scraps];
  }, [searchData]);

  // 클라이언트 사이드 정렬 (TYPE 정렬 등 추가 정렬 로직 적용)
  const sortedData = useMemo(
    () => sortScrapData(data, sortKey, sortOrder),
    [data, sortKey, sortOrder]
  );

  const isAllSelected = data.length > 0 && reducerState.selectedItems.length === data.length;

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <ScrapHeader
        reducerState={reducerState}
        navigateSearchPress={() => navigation.push('SearchScrap')}
        navigateTrashPress={() => navigation.push('DeletedScrap')}
        onEnterSelection={() => dispatch({ type: 'ENTER_SELECTION' })}
        onExitSelection={() => dispatch({ type: 'EXIT_SELECTION' })}
        isAllSelected={isAllSelected}
        onSelectAll={() => {
          const allItems = data.map((item) => ({ id: item.id, type: item.type }));
          dispatch({ type: 'SELECT_ALL', allItems: isAllSelected ? [] : allItems });
        }}
        onMove={() => {
          const selectedFolders = reducerState.selectedItems.filter(
            (selected) => selected.type === 'FOLDER'
          );
          if (selectedFolders.length > 0) {
            showToast('error', '스크랩만 이동이 가능합니다.');
            return;
          }
          if (reducerState.selectedItems.length === 0) {
            showToast('error', '이동할 스크랩을 선택해주세요.');
            return;
          }
          setIsMoveModalVisible(true);
        }}
        onDelete={async () => {
          if (reducerState.selectedItems.length === 0) {
            showToast('error', '삭제할 항목을 선택해주세요.');
            return;
          }

          try {
            const items = reducerState.selectedItems;

            await deleteScrap({ items });

            // 데이터 다시 불러오기
            await refetch();

            dispatch({ type: 'CLEAR_SELECTION' });
            showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
          } catch (error: any) {
            showToast('error', '삭제 중 오류가 발생했습니다.');
          }
        }}
      />
      <View className='bg-gray-100'>
        <Container className='items-end gap-[10px] py-[10px]'>
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
            <ScrapGrid
              data={[{ ADD: true }, ...sortedData]}
              reducerState={reducerState}
              dispatch={dispatch}
            />
          )}
        </Container>
      </View>
      <MoveScrapModal
        visible={isMoveModalVisible}
        onClose={() => setIsMoveModalVisible(false)}
        selectedItems={reducerState.selectedItems}
        onSuccess={() => {
          dispatch({ type: 'CLEAR_SELECTION' });
          refetch();
        }}
      />
    </View>
  );
};

export default ScrapScreen;
