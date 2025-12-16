import { Pressable, View } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { useMemo, useReducer, useState } from 'react';
import { reducer, initialSelectionState } from '../utils/reducer';
import { SortKey, SortOrder, sortScrapData } from '../utils/sortScrap';
import { useScrapStore, useTrashStore } from '@/stores/scrapDataStore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { Container } from '@/components/common';
import SortDropdown from '../components/Modal/SortDropdown';
import { ChevronDownFilledIcon, ChevronUpFilledIcon } from '@/components/system/icons';
import { ScrapGrid } from '../components/ScrapCardGrid';
import { showToast } from '../components/Modal/Toast';

type ScrapContentRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContent'>;

const ScrapContentScreen = () => {
  const route = useRoute<ScrapContentRouteProp>();
  const { id } = route.params;

  const [reducerState, dispatch] = useReducer(reducer, initialSelectionState);
  const [sortKey, setSortKey] = useState<SortKey>('TITLE'); // 기본: 이름순
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC'); // 기본: 오름차순
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();

  // Get item and contents directly from store
  const item = useScrapStore((state) => state.data.find((i) => i.id === id));
  const contents = useMemo(() => {
    return item?.type === 'FOLDER' ? item.contents : [];
  }, [item]);

  const deleteItem = useScrapStore((state) => state.deleteItem);
  const addToTrash = useTrashStore((state) => state.addToTrash);

  // Sort data directly from contents
  const sortedData = useMemo(
    () => sortScrapData(contents, sortKey, sortOrder),
    [contents, sortKey, sortOrder]
  );

  const isAllSelected =
    reducerState.selectedItems.length === contents.length && contents.length > 0;

  return (
    <View className='w-full flex-1 bg-gray-100'>
      <ScrapHeader
        reducerState={reducerState}
        title={item?.title}
        navigateback={navigation}
        navigateSearchPress={() => navigation.push('SearchScrap')}
        navigateTrashPress={() => navigation.push('DeletedScrap')}
        onEnterSelection={() => dispatch({ type: 'ENTER_SELECTION' })}
        onExitSelection={() => dispatch({ type: 'EXIT_SELECTION' })}
        onSelectAll={() => {
          const allIds = contents.map((item: { id: string }) => item.id);
          dispatch({ type: 'SELECT_ALL', allIds: isAllSelected ? [] : allIds });
        }}
        onDelete={async () => {
          try {
            const itemsToDelete = contents.filter((item: { id: string }) =>
              reducerState.selectedItems.includes(item.id)
            );
            addToTrash(itemsToDelete);
            deleteItem(reducerState.selectedItems, id);
          } finally {
            dispatch({ type: 'CLEAR_SELECTION' });
            showToast('success', '휴지통으로 이동해 한 달 후 영구 삭제됩니다.');
          }
        }}
      />
      <View className='bg-gray-100'>
        <Container className='items-end gap-[10px] py-[10px]'>
          <View className='flex-row items-center justify-between'>
            <SortDropdown ordertype={'CONTENT'} orderValue={sortKey} setOrderValue={setSortKey} />
            <Pressable onPress={() => setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))}>
              {sortOrder === 'ASC' ? <ChevronUpFilledIcon /> : <ChevronDownFilledIcon />}
            </Pressable>
          </View>
        </Container>
        <Container className='pb-[120px] pt-4'>
          <ScrapGrid data={sortedData} reducerState={reducerState} dispatch={dispatch} />
        </Container>
      </View>
    </View>
  );
};

export default ScrapContentScreen;
