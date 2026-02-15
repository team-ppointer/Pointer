import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import SortDropdown from '../components/Dropdown/SortDropdown';
import { useRecentScrapStore } from '@/features/student/scrap/stores/recentScrapStore';
import { mapUIKeyToAPIKey, sortScrapData } from '../utils/formatters/sortScrap';
import type { UISortKey, SortOrder, ScrapSearchResponse } from '../utils/types';
import { showToast } from '../components/Notification/Toast';
import { useSearchScraps, useDeleteScrap } from '@/apis';
import { validateOnlyScrapCanMove } from '../utils/validation';
import { RecentScrapCard } from '../components/Card/cards/RecentScrapCard';
import { useScrapModal } from '../contexts/ScrapModalsContext';
import { useScrapSelection, useScrapStoreSync } from '../hooks';
import { withScrapModals } from '../hoc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

const ScrapScreenContent = () => {
  const [reducerState, dispatch] = useScrapSelection();
  const [sortKey, setSortKey] = useState<UISortKey>('DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const recentScrapIds = useRecentScrapStore((state) => state.scrapIds);
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

  // refetch를 context에 등록
  React.useEffect(() => {
    if (refetch) {
      setRefetchScraps(refetch);
    }
  }, [refetch, setRefetchScraps]);

  // 화면 포커스 시 데이터 동기화 (다른 화면에서 변경 후 돌아왔을 때)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 최근 본 스크랩 데이터 (searchData에서 찾아서 최신 정보 표시)
  const recentScrapsData = useMemo(() => {
    if (recentScrapIds.length === 0 || !searchData) return [];

    const typedSearchData = searchData as ScrapSearchResponse;
    const allScraps = typedSearchData.scraps || [];
    const scrapsMap = new Map(allScraps.map((scrap) => [scrap.id, scrap]));

    // recentScrapIds 순서대로 스크랩 찾기 (존재하는 것만)
    return recentScrapIds
      .map((id) => scrapsMap.get(id))
      .filter((scrap): scrap is NonNullable<typeof scrap> => scrap != null)
      .map((scrap) => ({
        ...scrap,
        type: 'SCRAP' as const,
      }));
  }, [recentScrapIds, searchData]);

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

  // 유효한 스크랩 ID 목록 (폴더 내 스크랩 포함)
  const validScrapIds = useMemo(() => {
    if (!searchData) return undefined;
    const typedSearchData = searchData as ScrapSearchResponse;
    return (typedSearchData.scraps || []).map((scrap) => scrap.id);
  }, [searchData]);

  useScrapStoreSync(validScrapIds);

  const sortedData = useMemo(() => {
    return sortScrapData(data, sortKey, sortOrder);
  }, [data, sortKey, sortOrder]);

  const gridData = useMemo(() => [{ ADD: true } as const, ...sortedData], [sortedData]);

  const isAllSelected = data.length > 0 && reducerState.selectedItems.length === data.length;

  const insets = useSafeAreaInsets();

  return (
    <View className='w-full flex-1 bg-gray-100'>
      {reducerState.isSelecting && (
        <View
          style={{
            marginTop: -insets.top,
            height: insets.top,
            backgroundColor: colors['gray-200'],
          }}
        />
      )}
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

            try {
              await deleteScrap({
                items: items.map((item) => ({ id: item.id as number, type: item.type })),
              });
              dispatch({ type: 'CLEAR_SELECTION' });
              // 스크랩 삭제 후 쿼리 refetch → useScrapStoreSync가 자동으로 store 정리
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
        <Container className='pb-[120px] pt-[16px]'>
          {isLoading ? (
            <LoadingScreen label='데이터를 불러오고 있습니다.' />
          ) : (
            <ScrapGrid
              data={gridData}
              reducerState={reducerState}
              dispatch={dispatch}
            />
          )}
        </Container>
      </ScrollView>
    </View>
  );
};

const ScrapScreen = () => {
  return <ScrapScreenContent />;
};

export default withScrapModals(ScrapScreen);
