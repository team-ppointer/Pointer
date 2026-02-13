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
import type { SharedValue } from 'react-native-reanimated';

type AnswerType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';

type AnswerKeyboardSheetProps = {
  bottomInset: number;
  value: string;
  answerType?: AnswerType;
  animatedIndex?: SharedValue<number>;
  onAppendDigit: (digit: string) => void;
  onSelectChoice: (choice: string) => void;
  onDelete: () => void;
};

const AnswerKeyboardSheet = forwardRef<BottomSheet, AnswerKeyboardSheetProps>(
  (
    {
      bottomInset,
      value,
      answerType = 'SHORT_ANSWER',
      animatedIndex,
      onAppendDigit,
      onSelectChoice,
      onDelete,
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

    const renderKey = (label: string, onPress: () => void, flex = 1) => (
      <AnimatedPressable
        key={label}
        className='h-[46px] items-center justify-center rounded-full bg-white'
        containerStyle={{ flex }}
        onPress={onPress}>
        <Text className='text-18sb text-black'>{label}</Text>
      </AnimatedPressable>
    );

    const renderMultipleChoiceButton = (choice: string) => {
      const isSelected = value === choice;
      return (
        <AnimatedPressable
          key={choice}
          className={`my-[12px] h-[70px] w-[70px] items-center justify-center rounded-[16px] ${
            isSelected ? 'bg-primary-500' : 'bg-white'
          }`}
          style={isSelected && styles.choiceButtonShadow}
          onPress={() => onSelectChoice(choice)}>
          <Text className={`text-18sb ${isSelected ? 'text-white' : 'text-black'}`}>{choice}</Text>
        </AnimatedPressable>
      );
    };

    const renderMultipleChoiceInput = () => (
      <View className='flex-row items-center justify-center gap-[20px]'>
        {['1', '2', '3', '4', '5'].map(renderMultipleChoiceButton)}
      </View>
    );

    const renderShortAnswerInput = () => (
      <>
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
      </>
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        bottomInset={bottomInset}
        enableOverDrag={false}
        enableContentPanningGesture={false}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        animatedIndex={animatedIndex}>
        <BottomSheetView className='bg-gray-300 px-[4px] pb-[20px]'>
          <Container>
            {answerType === 'MULTIPLE_CHOICE'
              ? renderMultipleChoiceInput()
              : renderShortAnswerInput()}
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
  choiceButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default AnswerKeyboardSheet;
