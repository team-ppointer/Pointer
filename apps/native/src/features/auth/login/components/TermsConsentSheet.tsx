import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { colors } from '@theme/tokens';
import { CheckIcon, ChevronRightIcon } from 'lucide-react-native';
import { Container } from '@components/common';

type AgreementState = {
  age: boolean;
  service: boolean;
  privacy: boolean;
  marketing: boolean;
};

type TermsConsentSheetProps = {
  bottomInset: number;
  onConfirm: () => void;
  onSheetChange?: (isOpen: boolean) => void;
};

const REQUIRED_KEYS: Array<keyof AgreementState> = ['age', 'service', 'privacy'];
const ALL_KEYS: Array<keyof AgreementState> = [...REQUIRED_KEYS, 'marketing'];
const createDefaultState = (): AgreementState => ({
  age: false,
  service: false,
  privacy: false,
  marketing: false,
});

const TermsConsentSheet = forwardRef<BottomSheet, TermsConsentSheetProps>(
  ({ bottomInset, onConfirm, onSheetChange }, ref) => {
    const [agreements, setAgreements] = useState<AgreementState>(createDefaultState());

    const isAllChecked = useMemo(() => ALL_KEYS.every((key) => agreements[key]), [agreements]);
    const isRequiredChecked = useMemo(
      () => REQUIRED_KEYS.every((key) => agreements[key]),
      [agreements]
    );

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
        const isOpen = index >= 0;
        if (!isOpen) {
          setAgreements(createDefaultState());
        }

        onSheetChange?.(isOpen);
      },
      [onSheetChange]
    );

    const toggleAgreement = useCallback((key: keyof AgreementState) => {
      setAgreements((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }, []);

    const toggleAll = useCallback(() => {
      setAgreements((prev) => {
        const nextValue = !isAllChecked;
        const nextState = { ...prev };
        ALL_KEYS.forEach((key) => {
          nextState[key] = nextValue;
        });
        return nextState;
      });
    }, [isAllChecked]);

    const handleConfirm = useCallback(() => {
      if (!isRequiredChecked) return;
      onConfirm();
    }, [isRequiredChecked, onConfirm]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ display: 'none' }}
        onChange={handleSheetChange}
        style={{ padding: 0 }}>
        <BottomSheetView
          className='bg-white pb-[12px] pt-[4px]'
          style={{ paddingBottom: bottomInset }}>
          <Container>
            <Text className='text-20b text-gray-800'>회원가입을 위해 약관에 동의해주세요.</Text>
            <ConsentRow
              checked={isAllChecked}
              onToggle={toggleAll}
              label='모두 동의합니다.'
              isBold
              className='mt-[10px] bg-gray-200 py-[16px]'
            />
            <ConsentRow
              checked={agreements.age}
              onToggle={() => toggleAgreement('age')}
              label='만 14세 이상입니다.'
              description='만 14세 미만은 서비스 정책에 따라 회원가입이 제한됩니다.'
              className='mt-[10px]'
            />
            <ConsentRow
              checked={agreements.service}
              onToggle={() => toggleAgreement('service')}
              label='(필수) 서비스 이용약관 동의'
              withChevron
            />
            <ConsentRow
              checked={agreements.privacy}
              onToggle={() => toggleAgreement('privacy')}
              label='(필수) 개인정보 수집 및 이용 필수동의'
              withChevron
            />
            <ConsentRow
              checked={agreements.marketing}
              onToggle={() => toggleAgreement('marketing')}
              label='(선택) 마케팅 정보 수신 동의'
              withChevron
              className='mb-[12px]'
            />
            <Pressable
              className={`my-[10px] items-center justify-center rounded-[12px] px-[12px] py-[10px] ${
                isRequiredChecked
                  ? 'bg-primary-500 hover:bg-primary-600 active:bg-primary-600'
                  : 'bg-primary-200'
              }`}
              disabled={!isRequiredChecked}
              onPress={handleConfirm}>
              <Text className='text-16m text-white'>다음</Text>
            </Pressable>
          </Container>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

type ConsentRowProps = {
  checked: boolean;
  label: string;
  description?: string;
  withChevron?: boolean;
  isBold?: boolean;
  onToggle: () => void;
  className?: string;
};

const ConsentRow = ({
  checked,
  label,
  description,
  withChevron,
  isBold,
  onToggle,
  className,
}: ConsentRowProps) => {
  return (
    <Pressable
      className={`flex-row items-center justify-between rounded-[14px] px-[18px] py-[14px] ${className}`}
      accessibilityRole='checkbox'
      accessibilityState={{ checked }}
      onPress={onToggle}>
      <View className='flex-1 flex-row gap-[10px]'>
        <View
          className={`h-[24px] w-[24px] items-center justify-center rounded-[6px] border ${
            checked ? 'border-blue-500 bg-blue-500' : 'border-gray-600 bg-white'
          }`}>
          {checked ? <CheckIcon size={20} strokeWidth={2} color='white' /> : null}
        </View>
        <View className='flex-1 gap-[2px]'>
          <Text className={`${isBold ? 'text-16sb' : 'text-16m'} text-gray-900`}>{label}</Text>
          {description ? <Text className='text-14r text-gray-600'>{description}</Text> : null}
        </View>
      </View>
      {withChevron ? <ChevronRightIcon size={18} color={colors['gray-600']} /> : null}
    </Pressable>
  );
};

TermsConsentSheet.displayName = 'TermsConsentSheet';

export default TermsConsentSheet;
