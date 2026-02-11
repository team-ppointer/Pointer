import { AnimatedPressable, Container } from '@components/common';
import { colors } from '@theme/tokens';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CorrectIcon from './icons/CorrectIcon';
import IncorrectIcon from './icons/IncorrectIcon';

type ResultSheetProps = {
  bottomInset: number;
  isCorrect: boolean;
  primaryButtonLabel: string;
  onPressPrimary: () => void;
  secondaryButtonLabel?: string;
  onPressSecondary?: () => void;
  onSheetChange: (isOpen: boolean) => void;
  onSheetAnimate?: (fromIndex: number, toIndex: number) => void;
};

const ResultSheet = forwardRef<BottomSheet, ResultSheetProps>(
  (
    {
      bottomInset,
      isCorrect,
      primaryButtonLabel,
      onPressPrimary,
      secondaryButtonLabel,
      onPressSecondary,
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
          pressBehavior='none'
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
        enableOverDrag={false}
        bottomInset={bottomInset}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        onChange={handleSheetChange}
        onAnimate={onSheetAnimate}>
        <BottomSheetView className='bg-white px-[4px] pb-[20px]'>
          <View className='items-center justify-center gap-[8px] py-[20px]'>
            <IconComponent />
            <View className='flex-row items-center'>
              <Text className={`text-18sb ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? '정답' : '오답'}
              </Text>
              <Text className='text-18m text-gray-800'>입니다</Text>
            </View>
          </View>
          <View className='py-[10px]'>
            <Container className='flex-col items-center gap-[10px]'>
              {secondaryButtonLabel && onPressSecondary ? (
                <AnimatedPressable
                  className='h-[48px] w-full items-center justify-center rounded-[8px] border border-gray-500 bg-gray-100 px-[12px]'
                  containerStyle={{ width: '100%' }}
                  onPress={onPressSecondary}>
                  <Text className='text-16m text-gray-900'>{secondaryButtonLabel}</Text>
                </AnimatedPressable>
              ) : null}
              <AnimatedPressable
                className='bg-primary-500 h-[48px] w-full items-center justify-center rounded-[8px] px-[12px]'
                containerStyle={{ width: '100%' }}
                onPress={onPressPrimary}>
                <Text className='text-16m text-white'>{primaryButtonLabel}</Text>
              </AnimatedPressable>
            </Container>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ResultSheet.displayName = 'ResultSheet';

const styles = StyleSheet.create({
  sheetBackground: {},
  handleIndicator: {
    width: 56,
    height: 5,
    backgroundColor: colors['gray-600'],
  },
});

export default ResultSheet;
