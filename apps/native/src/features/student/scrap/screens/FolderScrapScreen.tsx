import { View } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { useMemo, useState, useEffect } from 'react';
import { sortScrapData, mapUIKeyToAPIKey } from '../utils/formatters/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { Container, LoadingScreen } from '@/components/common';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import { showToast } from '../components/Notification/Toast';
import { useGetScrapsByFolder, useDeleteScrap, useGetFolders } from '@/apis';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useScrapSelection } from '../hooks';
import { validateOnlyScrapCanMove } from '../utils/validation';
import { withScrapModals } from '../hoc';
import { useRecentScrapStore } from '../stores/recentScrapStore';
import { useNoteStore } from '../stores/scrapNoteStore';
import { SelectedItem } from '../utils/reducer';

type FolderScrapRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContent'>;

const FolderScrapScreenContent = () => {
  const route = useRoute<FolderScrapRouteProp>();
  const { id } = route.params;

  const [reducerState, dispatch] = useScrapSelection();
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { openMoveScrapModal, setRefetchScraps, setRefetchFolders } = useScrapModal();
  const removeScrap = useRecentScrapStore((state) => state.removeScrap);
  const closeNote = useNoteStore((state) => state.closeNote);

  // API 호출
  const { data: foldersData, refetch: refetchFolders } = useGetFolders();
  const { data: contentsData, isLoading, refetch } = useGetScrapsByFolder(id);
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // refetch를 context에 등록
  useEffect(() => {
    if (refetch) {
      setRefetchScraps(() => refetch);
    }
  }, [refetch, setRefetchScraps]);
  useEffect(() => {
    if (refetchFolders) {
      setRefetchFolders(refetchFolders);
    }
  }, [refetchFolders, setRefetchFolders]);

  // 폴더 정보 가져오기
  const folder = foldersData?.data?.find((f) => f.id === Number(id));
  const contents = contentsData?.data || [];

  // 정렬된 데이터
  const sortedData = useMemo(
    () => sortScrapData(contents, sortKey, sortOrder),
    [contents, sortKey, sortOrder]
  );

  const cleanupAfterDelete = (items: SelectedItem[]) => {
    items.forEach((item) => {
      if (item.type === 'SCRAP') {
        removeScrap(item.id as number);
        closeNote(item.id as number);
      }
    });
  };

  const isAllSelected =
    reducerState.selectedItems.length === contents.length && contents.length > 0;

  return (
    <>
      <View className='w-full flex-1 bg-gray-100'>
        <ScrapHeader
          reducerState={reducerState}
          title={folder?.name}
          navigateback={navigation}
          isAllSelected={isAllSelected}
          actions={{
            onSearchPress: () => navigation.push('SearchScrap'),
            onTrashPress: () => navigation.push('DeletedScrap'),
            onEnterSelection: () => dispatch({ type: 'ENTER_SELECTION' }),
            onExitSelection: () => dispatch({ type: 'EXIT_SELECTION' }),
            onSelectAll: () => {
              const allItems = contents.map((item) => ({ id: item.id, type: item.type }));
              dispatch({ type: 'SELECT_ALL', allItems: isAllSelected ? [] : allItems });
            },
            onMove: () => {
              if (validateOnlyScrapCanMove(reducerState.selectedItems)) {
                return;
              }
              if (reducerState.selectedItems.length === 0) {
                showToast('error', '이동할 스크랩을 선택해주세요.');
                return;
              }
              openMoveScrapModal({
                currentFolderId: Number(id),
                selectedItems: reducerState.selectedItems,
              });
              dispatch({ type: 'CLEAR_SELECTION' });
            },
            onDelete: async () => {
              if (reducerState.selectedItems.length === 0) {
                showToast('error', '삭제할 항목을 선택해주세요.');
                return;
              }

              dispatch({ type: 'CLEAR_SELECTION' });

              try {
                const items = reducerState.selectedItems;

                await deleteScrap({
                  items: items.map((item) => ({ id: item.id as number, type: item.type })),
                });
                cleanupAfterDelete(items);
                showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
              } catch (error: any) {
                showToast('error', '삭제 중 오류가 발생했습니다.');
              }
            },
          }}
        />
        <View className='bg-gray-100'>
          <Container className='items-end gap-[10px] py-[10px]'>
            <SortDropdown
              ordertype={'CONTENT'}
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
              <ScrapGrid data={sortedData} reducerState={reducerState} dispatch={dispatch} />
            )}
          </Container>
        </View>
      </View>
    </>
  );
};

const FolderScrapScreen = () => {
  return <FolderScrapScreenContent />;
};

export default withScrapModals(FolderScrapScreen);
