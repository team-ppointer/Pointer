import { SafeAreaView } from 'react-native-safe-area-context';
import { State } from '../../utils/reducer';
import { Container } from '@/components/common';
import { View, Text, Pressable } from 'react-native';
import { CircleCheckDashed } from '@/components/system/icons';
import { ArrowRightLeft, ChevronLeft, Trash2, Undo2 } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface DeletedScrapHeaderActions {
  onEnterSelection?: () => void;
  onExitSelection?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onSelectAll?: () => void;
}

interface DeletedScrapHeaderProps {
  navigateback: NativeStackNavigationProp<StudentRootStackParamList>;
  reducerState: State;
  isAllSelected?: boolean;
  actions: DeletedScrapHeaderActions;
}

const DeletedScrapHeader = ({
  navigateback,
  reducerState,
  isAllSelected,
  actions,
}: DeletedScrapHeaderProps) => {
  const isActionEnabled = reducerState.selectedItems.length > 0;
  return (
    <SafeAreaView
      edges={['top']}
      className={`bg-${!reducerState.isSelecting ? 'background' : 'gray-200'}`}>
      {!reducerState.isSelecting && (
        <Container className='flex-row items-center justify-between bg-gray-100 py-[14px]'>
          {navigateback.canGoBack() ? (
            <Pressable
              onPress={() => navigateback.goBack()}
              className='p-2 md:right-[48px] lg:right-[96px]'>
              <View className='items-center justify-center gap-[10px]'>
                <ChevronLeft className='text-black' size={32} />
              </View>
            </Pressable>
          ) : (
            <View className='h-[48px] w-[48px] gap-[10px]' />
          )}
          <View className='absolute left-0 right-0 items-center'>
            <Text className=' text-20b text-gray-900'>휴지통</Text>
          </View>
          <View className='flex-row items-center gap-1'>
            <Pressable
              className='h-[48px] w-[48px] gap-[10px] rounded-[8px] px-[3px] py-[9px]'
              onPress={actions.onEnterSelection}>
              <CircleCheckDashed />
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
            <Text className='text-16sb text-gray-900'>휴지통</Text>
            <Pressable onPress={actions.onExitSelection}>
              <Text className='text-14sb w-[72px] gap-[10px] rounded-[6px] px-1 text-blue-500'>
                완료
              </Text>
            </Pressable>
          </View>
          <View className='flex-row items-center justify-center gap-[160px] py-[4px]'>
            <Pressable
              onPress={() => {
                if (isActionEnabled && actions.onRestore) actions.onRestore();
              }}
              className={`flex-col items-center justify-center gap-0.5 rounded-[8px] px-[10px] py-[6px] ${reducerState.selectedItems.length > 0 ? '' : 'opacity-30'}`}>
              <Undo2 size={24} color={colors['primary-500']} />
              <Text className='text-12m text-primary-500'>복구</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (isActionEnabled && actions.onDelete) actions.onDelete();
              }}
              className={`flex-col items-center justify-center gap-0.5 rounded-[8px] px-[10px] py-[6px] ${reducerState.selectedItems.length > 0 ? '' : 'opacity-30'}`}>
              <Trash2 size={24} color={colors['red-400']} />
              <Text className='text-12m text-red-400'>영구 삭제</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DeletedScrapHeader;
