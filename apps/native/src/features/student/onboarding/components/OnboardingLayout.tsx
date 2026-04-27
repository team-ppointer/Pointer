import { type ReactNode, useEffect, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
  skipLabel?: string;
  onSkip?: () => void;
  contentClassName?: string;
  bottomSlot?: ReactNode;
  isScrollable?: boolean;
};

const OnboardingLayout = ({
  title,
  description,
  children,
  ctaLabel = '다음',
  ctaDisabled,
  onPressCTA,
  showBackButton = true,
  onPressBack,
  skipLabel,
  onSkip,
  contentClassName = '',
  bottomSlot,
  isScrollable = true,
}: Props) => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (showBackButton) return;

    navigation.setOptions({ gestureEnabled: false });

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [showBackButton, navigation]);

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: inset.top }}>
        <Header
          showBackButton={showBackButton}
          onPressBack={handleBack}
          right={
            skipLabel && onSkip ? (
              <Header.TextButton onPress={onSkip} color={colors['primary-600']}>
                {skipLabel}
              </Header.TextButton>
            ) : undefined
          }
        />
      </View>
      <ContentInset className='flex-1 pt-[6px]'>
        {isScrollable ? (
          <ScrollView
            className='flex-1'
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps='handled'>
            <View className={description ? 'mb-[32px]' : 'mb-[20px]'}>
              <Text className='typo-title-2-bold text-gray-800'>{title}</Text>
              {description ? (
                <Text className='typo-body-1-regular mt-[4px] text-gray-700'>{description}</Text>
              ) : null}
            </View>
            <View className={contentClassName}>{children}</View>
          </ScrollView>
        ) : (
          <View className='flex-1'>
            <View className={contentClassName}>{children}</View>
          </View>
        )}
        {bottomSlot}
        <AnimatedPressable
          accessibilityRole='button'
          onPress={onPressCTA}
          disabled={ctaDisabled}
          className={`mt-[10px] h-[48px] items-center justify-center rounded-[8px] px-[20px] ${
            ctaDisabled ? 'bg-primary-200' : 'bg-primary-600'
          }`}
          containerStyle={{ marginBottom: isKeyboardVisible ? 18 : inset.bottom + 18 }}>
          <Text className='typo-body-1-medium text-center text-white'>{ctaLabel}</Text>
        </AnimatedPressable>
      </ContentInset>
    </KeyboardAvoidingView>
  );
};

export default OnboardingLayout;
