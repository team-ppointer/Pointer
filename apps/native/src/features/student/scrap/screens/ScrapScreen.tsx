import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { reducer, selectState } from '../utils/reducer';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/ScrapItemGrid';
import SortDropdown from '../components/Modal/SortDropdown';
import { SortKey, SortOrder, sortScrapData } from '../utils/sortScrap';
import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { useScrapStore } from '@/stores';
import { showToast } from '../components/Modal/Toast';
import { folderDummy } from '../utils/testdataset';

const ScrapScreen = () => {
  const [reducerState, dispatch] = useReducer(reducer, selectState);
  const [fetchloading, setFetchLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('TYPE'); // 기본: 유형순
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC'); // 기본: 오름차순
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const data = useScrapStore((state) => state.data);
  const setData = useScrapStore((state) => state.setData);
  const deleteItem = useScrapStore((state) => state.deleteItem);

  // Fetching Data
  useEffect(() => {
    setFetchLoading(true);

    setTimeout(() => {
      setData(folderDummy); // 초기값 세팅
      setFetchLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    setData(sortScrapData(data, sortKey, sortOrder));
  }, [sortKey, sortOrder]);

  const isallSelected = reducerState.selectedItems.length === data.length;

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <ScrapHeader
        ruducerState={reducerState}
        navigateSearchPress={() => navigation.push('SearchScrap')}
        onEnterSelection={() => dispatch({ type: 'ENTER_SELECTION' })}
        onExitSelection={() => dispatch({ type: 'EXIT_SELECTION' })}
        isAllSelected={isallSelected}
        onSelectAll={() => {
          const allIds = folderDummy.map((item) => item.id);
          dispatch({ type: 'SELECT_ALL', allIds: isallSelected ? [] : allIds });
        }}
        onMove={() => {
          const selectedSet = new Set(reducerState.selectedItems);
          const selectedFolders = folderDummy.filter(
            (item) => selectedSet.has(item.id) && item.type === 'FOLDER'
          );
          if (selectedFolders.length > 0) showToast('error', '스크랩만 이동이 가능합니다.');
        }}
        onDelete={async () => {
          setFetchLoading(true);
          try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            deleteItem(reducerState.selectedItems);
          } finally {
            setFetchLoading(false);
            dispatch({ type: 'CLEAR_SELECTION' });
            showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
          }
        }}
      />
      <View className='bg-gray-100'>
        <Container className='items-end gap-[10px] py-[10px]'>
          <View className='flex-row items-center justify-between'>
            <SortDropdown orderValue={sortKey} setOrderValue={setSortKey} />
            <Pressable onPress={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}>
              {sortOrder === 'ASC' ? <ChevronUpFilledIcon /> : <ChevronDownFilledIcon />}
            </Pressable>
          </View>
        </Container>
        <Container className='pb-[120px] pt-4'>
          {fetchloading ? (
            <LoadingScreen label='데이터를 불러오고 있습니다.' />
          ) : (
            <ScrapGrid
              data={[{ ADD: true } as any, ...data]}
              state={reducerState}
              dispatch={dispatch}
            />
          )}
        </Container>
      </View>
    </View>
  );
};

export default ScrapScreen;
