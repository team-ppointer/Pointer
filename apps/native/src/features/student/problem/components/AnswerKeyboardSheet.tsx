import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { DeleteIcon } from 'lucide-react-native';
import { forwardRef, memo } from 'react';
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

const CHOICES = ['1', '2', '3', '4', '5'] as const;
const NUMBER_PAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

const NullHandle = () => null;

const sheetStyle = { borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadow.bottomsheet };
const contentStyle = {
  backgroundColor: colors['gray-300'],
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden' as const,
};

const NumberKey = memo(
  ({
    label,
    onAppendDigit,
    flex = 1,
  }: {
    label: string;
    onAppendDigit: (digit: string) => void;
    flex?: number;
  }) => (
    <AnimatedPressable
      className='h-[46px] items-center justify-center rounded-full bg-white'
      containerStyle={{ flex }}
      onPress={() => onAppendDigit(label)}>
      <Text className='typo-title-2-bold text-black'>{label}</Text>
    </AnimatedPressable>
  )
);
NumberKey.displayName = 'NumberKey';

const ChoiceButton = memo(
  ({
    choice,
    isSelected,
    onSelectChoice,
  }: {
    choice: string;
    isSelected: boolean;
    onSelectChoice: (choice: string) => void;
  }) => (
    <AnimatedPressable
      className={`size-[72px] items-center justify-center rounded-[16px] ${
        isSelected ? 'bg-primary-500' : 'bg-white'
      }`}
      style={isSelected && styles.choiceButtonShadow}
      onPress={() => onSelectChoice(choice)}>
      <Text className={`typo-title-2-bold ${isSelected ? 'text-white' : 'text-black'}`}>
        {choice}
      </Text>
    </AnimatedPressable>
  )
);
ChoiceButton.displayName = 'ChoiceButton';

const Backdrop = memo((props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    pressBehavior='close'
    style={{ backgroundColor: 'transparent' }}
  />
));
Backdrop.displayName = 'Backdrop';

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
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        bottomInset={bottomInset}
        enableOverDrag={false}
        enableContentPanningGesture={false}
        backdropComponent={Backdrop}
        enablePanDownToClose
        handleComponent={NullHandle}
        style={sheetStyle}
        animatedIndex={animatedIndex}>
        <BottomSheetView style={contentStyle}>
          <ContentInset>
            {answerType === 'MULTIPLE_CHOICE' ? (
              <View className='my-[32px] flex-row items-center justify-center gap-[20px]'>
                {CHOICES.map((choice) => (
                  <ChoiceButton
                    key={choice}
                    choice={choice}
                    isSelected={value === choice}
                    onSelectChoice={onSelectChoice}
                  />
                ))}
              </View>
            ) : (
              <>
                <View className='my-[20px] justify-center rounded-[10px] border border-gray-300 bg-white px-[16px] py-[11px]'>
                  <Text className={`typo-body-1-regular ${value ? 'text-black' : 'text-gray-600'}`}>
                    {value || '답을 입력해주세요.'}
                  </Text>
                </View>

                <View className='mb-[20px] gap-[10px]'>
                  {NUMBER_PAD.map((row) => (
                    <View key={row.join('-')} className='flex-row gap-[10px]'>
                      {row.map((key) => (
                        <NumberKey key={key} label={key} onAppendDigit={onAppendDigit} />
                      ))}
                    </View>
                  ))}
                  <View className='flex-row gap-[10px]'>
                    <View className='flex-1' />
                    <NumberKey label='0' onAppendDigit={onAppendDigit} />
                    <AnimatedPressable
                      className='h-[46px] items-center justify-center rounded-full bg-gray-400'
                      containerStyle={{ flex: 1 }}
                      onPress={onDelete}>
                      <DeleteIcon size={24} color={colors['gray-800']} />
                    </AnimatedPressable>
                  </View>
                </View>
              </>
            )}
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
