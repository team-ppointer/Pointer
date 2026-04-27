import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/tokens';
import { AnimatedPressable, ContentInset, Header } from '@components/common';

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onPressCTA: () => void;
  showBackButton?: boolean;
  onPressBack?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
  contentClassName?: string;
  bottomSlot?: ReactNode;
  isScrollable?: boolean;
};

export const EditScreenLayout = ({
  title,
  description,
  children,
  ctaLabel = '저장',
  ctaDisabled,
  onPressCTA,
  showBackButton = true,
  onPressBack,
  cancelLabel,
  onCancel,
  skipLabel,
  onSkip,
  contentClassName = '',
  bottomSlot,
  isScrollable = true,
}: Props) => {
  const inset = useSafeAreaInsets();

  const rightSlot =
    (cancelLabel && onCancel) || (skipLabel && onSkip) ? (
      <>
        {cancelLabel && onCancel && (
          <Header.TextButton onPress={onCancel} color={colors['gray-600']}>
            {cancelLabel}
          </Header.TextButton>
        )}
        {skipLabel && onSkip && (
          <Header.TextButton onPress={onSkip} color={colors['primary-600']}>
            {skipLabel}
          </Header.TextButton>
        )}
      </>
    ) : undefined;

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <Header showBackButton={showBackButton} onPressBack={onPressBack} right={rightSlot} />
      <ContentInset className='flex-1 pt-[6px]'>
        {isScrollable ? (
          <ScrollView
            className='flex-1'
            contentContainerClassName='pb-[32px]'
            keyboardShouldPersistTaps='handled'>
            <View className={description ? 'mb-[32px]' : 'mb-[20px]'}>
              <Text className='text-20b text-gray-800'>{title}</Text>
              {description ? (
                <Text className='text-16r mt-[4px] text-gray-700'>{description}</Text>
              ) : null}
            </View>
            <View className={contentClassName}>{children}</View>
          </ScrollView>
        ) : (
          <View className='flex-1'>
            <View className={description ? 'mb-[32px]' : 'mb-[20px]'}>
              <Text className='text-20b text-gray-800'>{title}</Text>
              {description ? (
                <Text className='text-16r mt-[4px] text-gray-700'>{description}</Text>
              ) : null}
            </View>
            <View className={contentClassName}>{children}</View>
          </View>
        )}
        {bottomSlot}
        <AnimatedPressable
          accessibilityRole='button'
          onPress={onPressCTA}
          disabled={ctaDisabled}
          className={`mt-[10px] rounded-[14px] py-[10px] ${
            ctaDisabled ? 'bg-primary-200' : 'bg-primary-500'
          }`}
          containerStyle={{ marginBottom: inset.bottom + 18 }}>
          <Text className='text-18sb text-center text-white'>{ctaLabel}</Text>
        </AnimatedPressable>
      </ContentInset>
    </KeyboardAvoidingView>
  );
};
