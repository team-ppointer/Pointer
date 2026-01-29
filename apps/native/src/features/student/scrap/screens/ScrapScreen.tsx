import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ImageBackground } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { useRecentScrapStore } from '@/features/student/scrap/stores/recentScrapStore';
import { sortScrapData, mapUIKeyToAPIKey } from '../utils/formatters/sortScrap';
import { useQueryClient } from '@tanstack/react-query';
import type { UISortKey, SortOrder, ScrapSearchResponse } from '../utils/types';
import { showToast } from '../components/Notification/Toast';
import { useSearchScraps, useDeleteScrap, client } from '@/apis';
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
  const recentScraps = useRecentScrapStore((state) => state.scraps);
  const { openMoveScrapModal, setRefetchScraps } = useScrapModal();

  const queryClient = useQueryClient();
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
  const removeScrapsByIds = useRecentScrapStore((state) => state.removeScrapsByIds);
  const closeNote = useNoteStore((state) => state.closeNote);
  const closeNotesByScrapIds = useNoteStore((state) => state.closeNotesByScrapIds);

  // refetch를 context에 등록
  React.useEffect(() => {
    if (refetch) {
      setRefetchScraps(refetch);
    }
  }, [refetch, setRefetchScraps]);

  const recentScrapsData = useMemo(() => {
    if (recentScraps.length === 0) return [];

    return recentScraps.map((item) => ({
      ...item.scrapDetail,
      type: 'SCRAP' as const,
    }));
  }, [recentScraps]);

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

  // // 클라이언트 사이드 정렬 (TYPE 정렬 등 추가 정렬 로직 적용)
  // deprecated
  // const sortedData = useMemo(
  //   () => sortScrapData(data, sortKey, sortOrder),
  //   [data, sortKey, sortOrder]
  // );

  const cleanupAfterDelete = (scrapIdsToRemove: number[]) => {
    if (scrapIdsToRemove.length > 0) {
      removeScrapsByIds(scrapIdsToRemove);
      closeNotesByScrapIds(scrapIdsToRemove);
    }
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
              if (reducerState.selectedItems.length === 0) {
                showToast('error', '이동할 스크랩을 선택해주세요.');
                return;
              }
              if (validateOnlyScrapCanMove(reducerState.selectedItems)) {
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
              const scrapIdsToRemove: number[] = [];

              // 삭제 전에 폴더 내 스크랩 ID 목록을 미리 수집
              for (const item of items) {
                if (item.type === 'SCRAP') {
                  scrapIdsToRemove.push(item.id as number);
                } else if (item.type === 'FOLDER' && item.id !== undefined) {
                  try {
                    const folderScrapsData = await queryClient.fetchQuery(
                      TanstackQueryClient.queryOptions(
                        'get',
                        '/api/student/scrap/folder/{folderId}/scraps',
                        {
                          params: {
                            path: { folderId: item.id },
                          },
                        }
                      )
                    );

                    const folderScrapIds =
                      folderScrapsData?.data
                        ?.filter((d: any) => d.type === 'SCRAP')
                        .map((d: any) => d.id) || [];

                    scrapIdsToRemove.push(...folderScrapIds);
                  } catch (error: any) {
                    showToast('error', error.message);
                  }
                }
              }

              try {
                await deleteScrap({
                  items: items.map((item) => ({ id: item.id as number, type: item.type })),
                });
                dispatch({ type: 'CLEAR_SELECTION' });
                cleanupAfterDelete(scrapIdsToRemove);
                showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
              } catch (error: any) {
                showToast('error', error.message);
              }
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
                data={[{ ADD: true }, ...data]}
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
