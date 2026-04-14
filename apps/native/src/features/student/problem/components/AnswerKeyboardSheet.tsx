import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { DeleteIcon } from 'lucide-react-native';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { colors, shadow } from '@theme/tokens';
import { AnimatedPressable, ContentInset } from '@components/common';

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
          style={{ backgroundColor: 'transparent' }}
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
        <Text className='typo-title-2-bold text-black'>{label}</Text>
      </AnimatedPressable>
    );

    const renderMultipleChoiceButton = (choice: string) => {
      const isSelected = value === choice;
      return (
        <AnimatedPressable
          key={choice}
          className={`size-[72px] items-center justify-center rounded-[16px] ${
            isSelected ? 'bg-primary-500' : 'bg-white'
          }`}
          style={isSelected && styles.choiceButtonShadow}
          onPress={() => onSelectChoice(choice)}>
          <Text className={`typo-title-2-bold ${isSelected ? 'text-white' : 'text-black'}`}>
            {choice}
          </Text>
        </AnimatedPressable>
      );
    };

    const renderMultipleChoiceInput = () => (
      <View className='my-[32px] flex-row items-center justify-center gap-[20px]'>
        {['1', '2', '3', '4', '5'].map(renderMultipleChoiceButton)}
      </View>
    );

    const renderShortAnswerInput = () => (
      <>
        <View className='my-[20px] justify-center rounded-[10px] border border-gray-300 bg-white px-[16px] py-[11px]'>
          <Text className={`typo-body-1-regular ${value ? 'text-black' : 'text-gray-600'}`}>
            {value || '답을 입력해주세요.'}
          </Text>
        </View>

        <View className='mb-[20px] gap-[10px]'>
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
        handleComponent={() => null}
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadow.bottomsheet }}
        animatedIndex={animatedIndex}>
        <BottomSheetView
          style={{
            backgroundColor: colors['gray-300'],
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          }}>
          <ContentInset>
            {answerType === 'MULTIPLE_CHOICE'
              ? renderMultipleChoiceInput()
              : renderShortAnswerInput()}
          </ContentInset>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AnswerKeyboardSheet.displayName = 'AnswerKeyboardSheet';

const styles = StyleSheet.create({
  choiceButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
});

export default AnswerKeyboardSheet;
