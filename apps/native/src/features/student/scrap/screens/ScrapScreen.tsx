import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ImageBackground } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { useRecentScrapStore } from '@/features/student/scrap/stores/recentScrapStore';
import { sortScrapData, mapUIKeyToAPIKey } from '../utils/formatters/sortScrap';
import type { UISortKey, SortOrder, ScrapSearchResponse } from '../utils/types';
import { showToast } from '../components/Notification/Toast';
import { useSearchScraps, useDeleteScrap } from '@/apis';
import { validateOnlyScrapCanMove } from '../utils/validation';
import { useQueries } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/apis';
import { RecentScrapCard } from '../components/Card/cards/RecentScrapCard';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useScrapSelection } from '../hooks';
import { withScrapModals } from '../hoc';
import { useNoteStore } from '../stores/scrapNoteStore';
import { SelectedItem } from '../utils/reducer';

const ScrapScreenContent = () => {
  const [reducerState, dispatch] = useScrapSelection();
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const recentScraps = useRecentScrapStore((state) => state.scrapIds);
  const { openMoveScrapModal, setRefetchScraps } = useScrapModal();

  const {
    data: searchData,
    isLoading,
    refetch,
  } = useSearchScraps({
    sort: mapUIKeyToAPIKey(sortKey),
    order: sortOrder,
  });
  const { mutateAsync: deleteScrap } = useDeleteScrap();
  const removeScrap = useRecentScrapStore((state) => state.removeScrap);
  const removeScrapsByFolderId = useRecentScrapStore((state) => state.removeScrapsByFolderId);
  const closeNote = useNoteStore((state) => state.closeNote);

  // refetch를 context에 등록
  React.useEffect(() => {
    if (refetch) {
      setRefetchScraps(() => refetch);
    }
  }, [refetch, setRefetchScraps]);

  const recentScrapsQueries = useQueries({
    queries:
      recentScraps.length > 0
        ? recentScraps.map((scrapId) => ({
            ...TanstackQueryClient.queryOptions('get', '/api/student/scrap/{id}', {
              params: {
                path: { id: scrapId },
              },
            }),
            enabled: scrapId > 0 && recentScraps.length > 0,
          }))
        : [],
  });

  const recentScrapsData = useMemo(() => {
    if (recentScraps.length === 0) return [];

    return recentScrapsQueries
      .map((query) => {
        const scrapDetail = query.data;
        if (!scrapDetail) return null;

        return {
          ...scrapDetail,
          type: 'SCRAP' as const,
        };
      })
      .filter((scrap): scrap is NonNullable<typeof scrap> => scrap !== null);
  }, [recentScrapsQueries, recentScraps.length]);

  // ScrapSearchResponse는 folders와 scraps를 각각 반환하므로 합쳐야 함
  const data = useMemo(() => {
    if (!searchData) return [];
    const typedSearchData = searchData as ScrapSearchResponse;
    const folders = (typedSearchData.folders || []).map((folder) => ({
      ...folder,
      type: 'FOLDER' as const,
    }));
    const scraps = (typedSearchData.scraps || []).filter((scrap) => scrap.folderId == null);
    return [...folders, ...scraps];
  }, [searchData]);

  // 클라이언트 사이드 정렬 (TYPE 정렬 등 추가 정렬 로직 적용)
  const sortedData = useMemo(
    () => sortScrapData(data, sortKey, sortOrder),
    [data, sortKey, sortOrder]
  );

  const cleanupAfterDelete = (items: SelectedItem[]) => {
    items.forEach((item) => {
      if (item.type === 'SCRAP') {
        removeScrap(item.id);
        closeNote(item.id);
      } else if (item.type === 'FOLDER' && item.id !== undefined) {
        removeScrapsByFolderId(item.id);  
      }
    });
  };

  const isAllSelected = data.length > 0 && reducerState.selectedItems.length === data.length;

  return (
    <>
      <View className='w-full flex-1 bg-gray-100'>
        <ScrapHeader
          reducerState={reducerState}
          isAllSelected={isAllSelected}
          actions={{
            onSearchPress: () => navigation.push('SearchScrap'),
            onTrashPress: () => navigation.push('DeletedScrap'),
            onEnterSelection: () => dispatch({ type: 'ENTER_SELECTION' }),
            onExitSelection: () => dispatch({ type: 'EXIT_SELECTION' }),
            onSelectAll: () => {
              const allItems = data.map((item) => ({ id: item.id, type: item.type }));
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

                deleteScrap(
                  {
                    items: items.map((item) => ({ id: item.id as number, type: item.type })),
                  },
                  {
                    onSuccess: () => {
                      showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.'); 
                      dispatch({ type: 'CLEAR_SELECTION' });
                      cleanupAfterDelete(items);
                    },
                    onError: (error: any) => {
                      showToast('error', error.message);
                    },  
                  }
                );  
            },
          }}
        />
        <ScrollView className='bg-gray-100' showsVerticalScrollIndicator={true}>
          {recentScrapsData.length > 0 && !reducerState.isSelecting && (
            <Container className='flex-col items-start  gap-[10px] pb-[40px] pt-[8px]'>
              <Text className='text-16m text-gray-900'>최근 본</Text>
              <ScrollView horizontal={true} contentContainerStyle={{ gap: 10 }}>
                {recentScrapsData.map((scrap) => (
                  <RecentScrapCard key={scrap.id} scrap={scrap} />
                ))}
              </ScrollView>
            </Container>
          )}
          <Container className='flex-row items-center justify-between gap-[10px] py-[10px]'>
            <Text className='text-16m text-gray-900'>전체 스크랩</Text>
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
        </ScrollView>
      </View>
    </>
  );
};

const ScrapScreen = () => {
  return <ScrapScreenContent />;
};

export default withScrapModals(ScrapScreen);
