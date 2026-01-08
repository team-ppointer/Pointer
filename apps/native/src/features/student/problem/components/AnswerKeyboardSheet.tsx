import { AnimatedPressable, Container } from '@components/common';
import { colors } from '@theme/tokens';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { DeleteIcon } from 'lucide-react-native';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type AnswerKeyboardSheetProps = {
  bottomInset: number;
  value: string;
  onAppendDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onClose: () => void;
  onSheetChange: (isOpen: boolean) => void;
  onSheetAnimate?: (fromIndex: number, toIndex: number) => void;
};

const AnswerKeyboardSheet = forwardRef<BottomSheet, AnswerKeyboardSheetProps>(
  (
    {
      bottomInset,
      value,
      onAppendDigit,
      onDelete,
      onSubmit,
      onClose,
      onSheetChange,
      onSheetAnimate,
    },
    ref
  ) => {
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior='close'
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

    const renderKey = (label: string, onPress: () => void, flex = 1) => (
      <AnimatedPressable
        key={label}
        className='h-[46px] items-center justify-center rounded-full bg-white'
        containerStyle={{ flex }}
        onPress={onPress}>
        <Text className='text-18sb text-black'>{label}</Text>
      </AnimatedPressable>
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        bottomInset={bottomInset}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        onChange={handleSheetChange}
        onAnimate={onSheetAnimate}>
        <BottomSheetView className='bg-gray-300 px-[4px] pb-[20px]'>
          <Container>
            <View className='mb-[20px] justify-center rounded-[8px] border border-gray-400 bg-white px-[12px] py-[8px]'>
              <Text className={`text-16m ${value ? 'text-gray-900' : 'text-gray-500'}`}>
                {value || '답을 입력해주세요.'}
              </Text>
            </View>

            <View className='gap-[10px]'>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
              ].map((row) => (
                <View key={row.join('-')} className='flex-row gap-[10px]'>
                  {row.map((key) => renderKey(key, () => onAppendDigit(key)))}
                </View>
              ))}
              <View className='flex-row gap-[10px]'>
                <View className='flex-1' />
                {renderKey('0', () => onAppendDigit('0'), 1)}
                <AnimatedPressable
                  className='h-[46px] items-center justify-center rounded-full bg-gray-400'
                  containerStyle={{ flex: 1 }}
                  onPress={onDelete}>
                  <DeleteIcon size={24} color={colors['gray-800']} />
                </AnimatedPressable>
              </View>
            </View>
          </Container>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AnswerKeyboardSheet.displayName = 'AnswerKeyboardSheet';

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

export default AnswerKeyboardSheet;
