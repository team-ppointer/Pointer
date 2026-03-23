import { View } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetScrapsByFolder, useDeleteScrap, useGetFolders } from '@/apis';
import { Container, LoadingScreen } from '@/components/common';
import { type StudentRootStackParamList } from '@/navigation/student/types';

import ScrapHeader from '../components/Header/ScrapHeader';
import { mapUIKeyToAPIKey, sortScrapData } from '../utils/formatters/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import { showToast } from '../components/Notification/Toast';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useScrapSelection } from '../hooks';
import { validateOnlyScrapCanMove } from '../utils/validation';
import { withScrapModals } from '../hoc';

type FolderScrapRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContent'>;

const FolderScrapScreenContent = () => {
  const route = useRoute<FolderScrapRouteProp>();
  const { id } = route.params;

  const [reducerState, dispatch] = useScrapSelection();
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const { openMoveScrapModal, setRefetchScraps, setRefetchFolders } = useScrapModal();

  // API 호출
  const { data: foldersData, refetch: refetchFolders } = useGetFolders(); // 폴더 정보 가져오기

  const {
    data: data,
    isLoading,
    refetch,
  } = useGetScrapsByFolder(
    { folderId: Number(id) },
    { sortOption: mapUIKeyToAPIKey(sortKey), order: sortOrder }
  ); // 해당 폴더의 스크랩 가져오기

  // 폴더 변경 시 폴더 목록 refetch
  useEffect(() => {
    if (refetchFolders) {
      setRefetchFolders(refetchFolders);
    }
  }, [refetchFolders, setRefetchFolders]);

  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // refetch를 context에 등록
  useEffect(() => {
    if (refetch) {
      setRefetchScraps(() => refetch);
    }
  }, [refetch, setRefetchScraps]);

  // 폴더 정보 가져오기
  const folder = foldersData?.data?.find((f) => f.id === Number(id));
  const contents = data?.data || [];

  const sortedData = useMemo(() => {
    return sortScrapData(contents, sortKey, sortOrder);
  }, [contents, sortKey, sortOrder]);

  const isAllSelected =
    reducerState.selectedItems.length === contents.length && contents.length > 0;

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <SafeAreaView
        edges={['top']}
        className={`bg-${!reducerState.isSelecting ? 'gray-100' : 'gray-200'}`}>
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
              if (reducerState.selectedItems.length === 0) {
                showToast('error', '이동할 스크랩을 선택해주세요.');
                return;
              }
              if (validateOnlyScrapCanMove(reducerState.selectedItems)) {
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
              const items = reducerState.selectedItems;

              try {
                await deleteScrap({
                  items: items.map((item) => ({ id: item.id as number, type: item.type })),
                });
                dispatch({ type: 'CLEAR_SELECTION' });
                showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
              } catch (error: unknown) {
                showToast('error', error instanceof Error ? error.message : '삭제에 실패했습니다.');
              }
            },
          }}
        />
      </SafeAreaView>
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
  );
};

const FolderScrapScreen = () => {
  return <FolderScrapScreenContent />;
};

export default withScrapModals(FolderScrapScreen);
