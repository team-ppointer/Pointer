import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { shadow } from '@theme/tokens';
import { AnimatedPressable, ContentInset } from '@components/common';

import CorrectIcon from './icons/CorrectIcon';
import IncorrectIcon from './icons/IncorrectIcon';

type ResultSheetProps = {
  bottomInset: number;
  isCorrect: boolean;
  primaryButtonLabel: string;
  onPressPrimary: () => void;
  secondaryButtonLabel?: string;
  onPressSecondary?: () => void;
  animatedIndex?: SharedValue<number>;
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
      animatedIndex,
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

    const IconComponent = isCorrect ? CorrectIcon : IncorrectIcon;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        enableOverDrag={false}
        bottomInset={bottomInset}
        backdropComponent={renderBackdrop}
        handleComponent={() => null}
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadow.bottomsheet }}
        animatedIndex={animatedIndex}>
        <BottomSheetView
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          }}>
          <View className='items-center justify-center gap-[8px] py-[30px]'>
            <IconComponent />
            <View className='flex-row items-baseline'>
              <Text
                className={`typo-heading-1-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? '정답' : '오답'}
              </Text>
              <Text className='typo-body-1-medium text-gray-800'>입니다</Text>
            </View>
          </View>
          <View className='pt-[10px] pb-[20px]'>
            <ContentInset className='flex-col items-center gap-[10px]'>
              {secondaryButtonLabel && onPressSecondary ? (
                <AnimatedPressable
                  className='h-[48px] w-full items-center justify-center rounded-[8px] border border-gray-500 bg-gray-100 px-[12px]'
                  containerStyle={{ width: '100%' }}
                  onPress={onPressSecondary}>
                  <Text className='typo-body-1-medium text-gray-900'>{secondaryButtonLabel}</Text>
                </AnimatedPressable>
              ) : null}
              <AnimatedPressable
                className='bg-primary-600 h-[48px] w-full items-center justify-center rounded-[8px] px-[12px]'
                containerStyle={{ width: '100%' }}
                onPress={onPressPrimary}>
                <Text className='typo-body-1-medium text-white'>{primaryButtonLabel}</Text>
              </AnimatedPressable>
            </ContentInset>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ResultSheet.displayName = 'ResultSheet';

export default ResultSheet;
