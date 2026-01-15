import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'lucide-react-native';
import { colors } from '@theme/tokens';
import { AnimatedPressable, Container } from '@components/common';

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
  contentClassName = '',
  bottomSlot,
  isScrollable = true,
}: Props) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (!showBackButton) return;
    if (onPressBack) {
      onPressBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const inset = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <View
        className='z-10 flex-row items-center justify-between bg-gray-100 px-[20px] pb-[14px]'
        style={{ paddingTop: inset.top + 14 }}>
        {showBackButton ? (
          <AnimatedPressable
            accessibilityRole='button'
            onPress={handleBack}
            className='items-center justify-center p-[8px]'>
            <ChevronLeftIcon color={colors['gray-800']} size={32} />
          </AnimatedPressable>
        ) : (
          <View className='h-[36px] w-[36px]' />
        )}
        {cancelLabel && onCancel ? (
          <AnimatedPressable
            onPress={onCancel}
            className='h-[48px] items-center justify-center px-[10px]'>
            <Text className='text-14sb text-gray-600'>{cancelLabel}</Text>
          </AnimatedPressable>
        ) : (
          <View className='h-[20px]' />
        )}
      </View>
      <Container className='flex-1 pt-[6px]'>
        {isScrollable ? (
          <ScrollView
            className='flex-1 overflow-visible'
            contentContainerStyle={{ paddingBottom: 32 }}
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
      </Container>
    </KeyboardAvoidingView>
  );
};
