import { Container } from '@/components/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { ArrowRightLeft, ChevronLeft, Search, Trash2 } from 'lucide-react-native';
import { CircleCheckDashed } from '@/components/system/icons';
import { State } from '../../utils/reducer';
import { colors } from '@/theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentRootStackParamList } from '@/navigation/student/types';

export interface ScrapHeaderActions {
  /** 검색 화면으로 이동 */
  onSearchPress?: () => void;
  /** 휴지통 화면으로 이동 */
  onTrashPress?: () => void;
  /** 선택 모드 진입 */
  onEnterSelection?: () => void;
  /** 선택 모드 종료 */
  onExitSelection?: () => void;
  /** 선택된 아이템 이동 */
  onMove?: () => void;
  /** 선택된 아이템 삭제 */
  onDelete?: () => void;
  /** 전체 선택/해제 */
  onSelectAll?: () => void;
}

interface ScrapHeaderProps {
  /** 뒤로가기 네비게이션 (옵션) */
  navigateback?: NativeStackNavigationProp<StudentRootStackParamList>;
  /** 헤더 제목 */
  title?: string;
  /** 선택 상태 */
  reducerState: State;
  /** 전체 선택 여부 */
  isAllSelected?: boolean;
  /** 액션 핸들러 객체 */
  actions: ScrapHeaderActions;
}

const ScrapHeader = ({
  navigateback,
  title = '스크랩',
  reducerState,
  isAllSelected,
  actions,
}: ScrapHeaderProps) => {
  const isActionEnabled = reducerState.selectedItems.length > 0;

  return (
    <SafeAreaView
      edges={['top']}
      className={`bg-${!reducerState.isSelecting ? 'background' : 'gray-200'}`}>
      {!reducerState.isSelecting && (
        <Container className='flex-row items-center justify-between bg-gray-100 py-[14px]'>
          {navigateback && navigateback.canGoBack() && (
            <Pressable
              onPress={() => navigateback.goBack()}
              className='p-2 md:right-[48px] lg:right-[96px]'>
              <View className='items-center justify-center gap-[10px]'>
                <ChevronLeft className='text-black' size={32} />
              </View>
            </Pressable>
          )}
          {navigateback ? (
            <View className='absolute left-0 right-0 items-center'>
              <Text className='text-20b text-gray-900'>{title}</Text>
            </View>
          ) : (
            <Text className='text-20b text-gray-900'>{title}</Text>
          )}
          <View className='flex-row items-center gap-1'>
            <Pressable
              className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'
              onPress={actions.onSearchPress}>
              <Search size={24} strokeWidth={2} />
            </Pressable>
            <Pressable
              className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'
              onPress={actions.onEnterSelection}>
              <CircleCheckDashed />
            </Pressable>
            <Pressable
              className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'
              onPress={actions.onTrashPress}>
              <Trash2 size={24} strokeWidth={2} color='#FF3B30' />
            </Pressable>
          </View>
        </Container>
      )}

      {reducerState.isSelecting && (
        <View className='flex-col border-b border-gray-400 bg-gray-200'>
          <View className='flex-row justify-between px-5 py-0.5'>
            <Pressable onPress={actions.onSelectAll}>
              <Text className='text-14m gap-[10px] px-2.5 text-blue-500'>
                {!isAllSelected ? '전체 선택' : '전체 해제'}
              </Text>
            </Pressable>
            <Text className='text-16sb text-gray-800'>{title}</Text>
            <Pressable onPress={actions.onExitSelection}>
              <Text className='text-14sb w-[72px] gap-[10px] rounded-[6px] px-1 text-blue-500'>
                완료
              </Text>
            </Pressable>
          </View>
          <View className='flex-row items-center justify-center gap-[50px] py-[6px]'>
            <Pressable
              onPress={() => {
                if (isActionEnabled && actions.onMove) actions.onMove();
              }}
              className={`flex-col items-center justify-center gap-0.5 rounded-[8px] p-[6px] ${reducerState.selectedItems.length > 0 ? '' : 'opacity-30'}`}>
              <ArrowRightLeft size={24} color={colors['primary-500']} />
              <Text className='text-12m text-primary-500'>이동</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (isActionEnabled && actions.onDelete) actions.onDelete();
              }}
              className={`flex-col items-center justify-center gap-0.5 rounded-[8px] p-[6px] ${reducerState.selectedItems.length > 0 ? '' : 'opacity-30'}`}>
              <Trash2 size={24} color={colors['red-400']} />
              <Text className='text-12m text-red-400'>삭제</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScrapHeader;
