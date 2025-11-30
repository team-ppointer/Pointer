import { Container } from '@components/common';
import { colors } from '@theme/tokens';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CorrectIcon from './icons/CorrectIcon';
import IncorrectIcon from './icons/IncorrectIcon';
import { StudentRootStackParamList } from '@/navigation/student/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ResultSheetProps = {
  bottomInset: number;
  isCorrect: boolean;
  onSheetChange: (isOpen: boolean) => void;
  onSheetAnimate?: (fromIndex: number, toIndex: number) => void;
  navigation?: NativeStackNavigationProp<StudentRootStackParamList, 'Problem'>;
};

const ResultSheet = forwardRef<BottomSheet, ResultSheetProps>(
  ({ bottomInset, isCorrect, onSheetChange, onSheetAnimate, navigation }, ref) => {

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          // pressBehavior='none'
          enableTouchThrough={false}
        />
      ),
      []
    );

    const handleSheetChange = useCallback(
      (index: number) => {
        onSheetChange(index >= 0);
      },
      [onSheetChange]
    );

    const IconComponent = isCorrect ? CorrectIcon : IncorrectIcon;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        bottomInset={bottomInset}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        onChange={handleSheetChange}
        onAnimate={onSheetAnimate}>
        <BottomSheetView className='bg-white px-[4px] pb-[20px]'>
          <View className='items-center justify-center bg-gray-300 py-[20px]'>
            <IconComponent />
          </View>
          <View className='py-[10px]'>
            <Container className='flex-col items-center gap-[10px]'>
              {!isCorrect && (
                <Pressable
                  className='h-[42px] w-full items-center justify-center rounded-[8px] border border-gray-500 bg-gray-100 px-[18px]'
                  onPress={() => {}}>
                  <Text className='text-16m text-black'>다시 풀어보기</Text>
                </Pressable>
              )}
              <Pressable
                className='bg-primary-500 h-[42px] w-full items-center justify-center rounded-[8px] px-[18px]'
                onPress={() => navigation?.navigate('Pointing')}>
                <Text className='text-16m text-white'>포인팅 학습하기</Text>
              </Pressable>
            </Container>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ResultSheet.displayName = 'ResultSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors['gray-300'],
  },
  handleIndicator: {
    width: 56,
    height: 5,
    backgroundColor: colors['gray-600'],
  },
});

export default ResultSheet;
