import { Container, LoadingScreen } from '@/components/common';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useReducer, useState } from 'react';
import { View, Text } from 'react-native';
import { reducer, selectState } from '../utils/reducer';
import ScrapHeader from '../components/ScrapHeader';
import ScrapGrid, { DummyItem } from '../components/ScrapItemGrid';
import SortDropdown from '../components/SortDropdown';

const folderDummy: DummyItem[] = Array.from({ length: 13 }, (_, i) => {
  if (i % 3 === 0) {
    return {
      type: 'Folder',
      id: i.toString(),
      title: '폴더명',
      amount: 127 + i,
    };
  } else {
    return {
      type: 'Scrap',
      id: i.toString(),
      title: '스크랩명',
      timestamp: 202511191130 - i * 11,
    };
  }
});

const ScrapScreen = () => {
  const [reducerState, dispatch] = useReducer(reducer, selectState);
  const [data, setData] = useState(folderDummy);
  const [fetchloading, setFetchLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  const orderList = [
    { label: '유형순', value: 'type' },
    { label: '이름순', value: 'name' },
    { label: '최신순', value: 'latest' },
  ];
  const [order, setOrder] = useState({
    label: '유형순',
    value: 'type',
  });

  const isallSelected = reducerState.selectedItems.length === folderDummy.length;

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
            (item) => selectedSet.has(item.id) && item.type === 'Folder'
          );
          if (selectedFolders.length > 0) console.log(selectedFolders);
        }}
        onDelete={async () => {
          setFetchLoading(true);

          try {
            const selectedSet = new Set(reducerState.selectedItems);

            await new Promise((resolve) => setTimeout(resolve, 500));

            setData((prev) => prev.filter((item) => !selectedSet.has(item.id)));
          } finally {
            setFetchLoading(false);
            dispatch({ type: 'CLEAR_SELECTION' });
          }
        }}
      />
      <View className='bg-gray-100'>
        <Container className='items-end gap-[10px] py-[10px]'>
          <SortDropdown orderList={orderList} order={order} setOrder={setOrder} />
        </Container>
        <Container className='pb-[120px] pt-4'>
          {fetchloading ? (
            <LoadingScreen label='데이터를 불러오고 있습니다.' />
          ) : (
            <ScrapGrid data={data} state={reducerState} dispatch={dispatch} />
          )}
        </Container>
      </View>
    </View>
  );
};

export default ScrapScreen;
