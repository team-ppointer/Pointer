import { View } from 'react-native';
import ScrapHeader from '../components/Header/ScrapHeader';
import { useMemo, useReducer, useState } from 'react';
import { reducer, initialSelectionState } from '../utils/reducer';
import { sortScrapData, mapUIKeyToAPIKey } from '../utils/sortScrap';
import type { UISortKey, SortOrder } from '../utils/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { Container, LoadingScreen } from '@/components/common';
import SortDropdown from '../components/Modal/SortDropdown';
import { ScrapGrid } from '../components/Card/ScrapCardGrid';
import { showToast } from '../components/Modal/Toast';
import { useGetScrapsByFolder, useDeleteScrap, useGetFolders } from '@/apis';
import { MoveScrapModal } from '../components/Modal/MoveScrapModal';

type ScrapContentRouteProp = RouteProp<StudentRootStackParamList, 'ScrapContent'>;

const ScrapContentScreen = () => {
  const route = useRoute<ScrapContentRouteProp>();
  const { id } = route.params;

  const [reducerState, dispatch] = useReducer(reducer, initialSelectionState);
  const [sortKey, setSortKey] = useState<UISortKey>('TITLE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');
  const navigation = useNavigation<NativeStackNavigationProp<StudentRootStackParamList>>();
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);

  // API 호출
  const { data: foldersData } = useGetFolders();
  const { data: contentsData, isLoading, refetch } = useGetScrapsByFolder(id);
  const { mutateAsync: deleteScrap } = useDeleteScrap();

  // 폴더 정보 가져오기
  const folder = foldersData?.data?.find((f) => f.id === Number(id));
  const contents = contentsData?.data || [];

  // 정렬된 데이터
  const sortedData = useMemo(
    () => sortScrapData(contents, sortKey, sortOrder),
    [contents, sortKey, sortOrder]
  );

  const isAllSelected =
    reducerState.selectedItems.length === contents.length && contents.length > 0;

  return (
    <>
      <View className='w-full flex-1 bg-gray-100'>
        <ScrapHeader
          reducerState={reducerState}
          title={folder?.name}
          navigateback={navigation}
          navigateSearchPress={() => navigation.push('SearchScrap')}
          navigateTrashPress={() => navigation.push('DeletedScrap')}
          onEnterSelection={() => dispatch({ type: 'ENTER_SELECTION' })}
          onExitSelection={() => dispatch({ type: 'EXIT_SELECTION' })}
          isAllSelected={isAllSelected}
          onSelectAll={() => {
            const allItems = contents.map((item) => ({ id: item.id, type: item.type }));
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
      <MoveScrapModal
        currentFolderId={Number(id)}
        visible={isMoveModalVisible}
        onClose={() => setIsMoveModalVisible(false)}
        selectedItems={reducerState.selectedItems}
        onSuccess={() => {
          dispatch({ type: 'CLEAR_SELECTION' });
          refetch();
        }}
      />
    </>
  );
};

export default ScrapContentScreen;
