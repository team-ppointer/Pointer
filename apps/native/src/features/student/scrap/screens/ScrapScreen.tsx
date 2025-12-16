import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { reducer, initialSelectionState } from '../utils/reducer';
import ScrapHeader from '../components/Header/ScrapHeader';
import { ScrapGrid } from '../components/ScrapCardGrid';
import SortDropdown from '../components/Modal/SortDropdown';
import { SortKey, SortOrder, sortScrapData } from '../utils/sortScrap';
import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { useScrapStore, useTrashStore } from '@/stores';
import { showToast } from '../components/Modal/Toast';
import { folderDummy } from '../utils/testdataset';

const ScrapScreen = () => {
  const [reducerState, dispatch] = useReducer(reducer, initialSelectionState);
  const [fetchloading, setFetchLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('TYPE'); // 기본: 유형순
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC'); // 기본: 오름차순
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const data = useScrapStore((state) => state.data);
  const setData = useScrapStore((state) => state.setData);
  const deleteItem = useScrapStore((state) => state.deleteItem);
  const addToTrash = useTrashStore((state) => state.addToTrash);

  useEffect(() => {
    setFetchLoading(true);

    setTimeout(() => {
      setData(folderDummy); // 초기값 세팅
      setFetchLoading(false);
    }, 200);
  }, []);

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
          const allIds = data.map((item) => item.id);
          dispatch({ type: 'SELECT_ALL', allIds: isAllSelected ? [] : allIds });
        }}
        onMove={() => {
          const selectedFolders = data.filter(
            (item) => reducerState.selectedItems.includes(item.id) && item.type === 'FOLDER'
          );
          if (selectedFolders.length > 0) {
            showToast('error', '스크랩만 이동이 가능합니다.');
          }
        }}
        onDelete={async () => {
          setFetchLoading(true);
          try {
            const items = data.filter((i) => reducerState.selectedItems.includes(i.id));
            addToTrash(items);
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
            <SortDropdown ordertype={'LIST'} orderValue={sortKey} setOrderValue={setSortKey} />
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
              data={[{ ADD: true }, ...sortedData]}
              reducerState={reducerState}
              dispatch={dispatch}
            />
          )}
        </Container>
      </View>
    </View>
  );
};

export default ScrapScreen;
