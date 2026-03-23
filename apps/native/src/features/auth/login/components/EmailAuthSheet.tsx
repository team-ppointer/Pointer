import { forwardRef, useCallback, useState, useMemo } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {
  ChevronLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react-native';

import { colors } from '@theme/tokens';
import { AnimatedPressable, Container } from '@components/common';
import {
  postPasswordResetSendCode,
  postPasswordResetVerifyCode,
  postPasswordReset,
} from '@apis/student';

import useEmailAuth, {
  type EmailAuthStep,
  validateEmail,
  validatePassword,
} from '../hooks/useEmailAuth';

type EmailAuthSheetProps = {
  bottomInset: number;
  onClose?: () => void;
};

type TermsAgreement = {
  isGteFourteen: boolean;
  isAgreeServiceUsage: boolean;
  isAgreePersonalInformation: boolean;
  isAgreeReceiveMarketing: boolean;
};

const EmailAuthSheet = forwardRef<BottomSheet, EmailAuthSheetProps>(
  ({ bottomInset, onClose }, ref) => {
    const {
      step,
      email,
      isLoading,
      error,
      setEmail,
      checkEmail,
      login,
      signup,
      goToForgotPassword,
      goBack,
      reset,
      setStep,
      proceedToSignup,
    } = useEmailAuth();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [termsAgreement, setTermsAgreement] = useState<TermsAgreement>({
      isGteFourteen: false,
      isAgreeServiceUsage: false,
      isAgreePersonalInformation: false,
      isAgreeReceiveMarketing: false,
    });

    // 비밀번호 찾기 상태
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior='close'
        />
      ),
      []
    );

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1) {
          // Sheet closed
          reset();
          setPassword('');
          setPasswordConfirm('');
          setShowPassword(false);
          setTermsAgreement({
            isGteFourteen: false,
            isAgreeServiceUsage: false,
            isAgreePersonalInformation: false,
            isAgreeReceiveMarketing: false,
          });
          setResetCode('');
          setNewPassword('');
          setResetError(null);
          onClose?.();
        }
      },
      [reset, onClose]
    );

    const handleBack = useCallback(() => {
      if (step === 'email') {
        (ref as React.RefObject<BottomSheet>)?.current?.close();
      } else {
        goBack();
        setPassword('');
        setPasswordConfirm('');
        setResetCode('');
        setNewPassword('');
        setResetError(null);
      }
    }, [step, goBack, ref]);

    const handleEmailSubmit = useCallback(async () => {
      await checkEmail();
    }, [checkEmail]);

    const handleLoginSubmit = useCallback(async () => {
      await login(password);
    }, [login, password]);

    const handleSignupSubmit = useCallback(async () => {
      if (password !== passwordConfirm) {
        return;
      }
      await signup(password, termsAgreement);
    }, [signup, password, passwordConfirm, termsAgreement]);

    const handleTermsConfirm = useCallback(() => {
      proceedToSignup();
    }, [proceedToSignup]);

    // 비밀번호 찾기 - 코드 전송
    const handleSendResetCode = useCallback(async () => {
      setResetLoading(true);
      setResetError(null);
      try {
        const { error } = await postPasswordResetSendCode({ email });
        if (error) {
          throw new Error('인증 코드 전송에 실패했습니다.');
        }
        setStep('forgot-code');
      } catch (e: unknown) {
        setResetError(e instanceof Error ? e.message : '인증 코드 전송에 실패했습니다.');
      } finally {
        setResetLoading(false);
      }
    }, [email, setStep]);

    // 비밀번호 찾기 - 코드 확인
    const handleVerifyCode = useCallback(async () => {
      setResetLoading(true);
      setResetError(null);
      try {
        const { error } = await postPasswordResetVerifyCode({
          email,
          code: resetCode,
        });
        if (error) {
          throw new Error('인증 코드가 올바르지 않습니다.');
        }
        setStep('forgot-reset');
      } catch (e: unknown) {
        setResetError(e instanceof Error ? e.message : '인증 코드 확인에 실패했습니다.');
      } finally {
        setResetLoading(false);
      }
    }, [email, resetCode, setStep]);

    // 비밀번호 찾기 - 비밀번호 재설정
    const handleResetPassword = useCallback(async () => {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setResetError(passwordError);
        return;
      }

      setResetLoading(true);
      setResetError(null);
      try {
        const { error } = await postPasswordReset({
          email,
          code: resetCode,
          newPassword,
        });
        if (error) {
          throw new Error('비밀번호 재설정에 실패했습니다.');
        }
        // 재설정 성공 시 로그인 화면으로 이동
        setStep('login');
        setPassword('');
        setResetCode('');
        setNewPassword('');
      } catch (e: unknown) {
        setResetError(e instanceof Error ? e.message : '비밀번호 재설정에 실패했습니다.');
      } finally {
        setResetLoading(false);
      }
    }, [email, resetCode, newPassword, setStep]);

    // 약관 동의 관련
    const REQUIRED_TERMS: (keyof TermsAgreement)[] = [
      'isGteFourteen',
      'isAgreeServiceUsage',
      'isAgreePersonalInformation',
    ];
    const ALL_TERMS: (keyof TermsAgreement)[] = [...REQUIRED_TERMS, 'isAgreeReceiveMarketing'];

    const isAllTermsChecked = useMemo(
      () => ALL_TERMS.every((key) => termsAgreement[key]),
      [termsAgreement]
    );
    const isRequiredTermsChecked = useMemo(
      () => REQUIRED_TERMS.every((key) => termsAgreement[key]),
      [termsAgreement]
    );

    const toggleTerm = useCallback((key: keyof TermsAgreement) => {
      setTermsAgreement((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const toggleAllTerms = useCallback(() => {
      const nextValue = !isAllTermsChecked;
      setTermsAgreement({
        isGteFourteen: nextValue,
        isAgreeServiceUsage: nextValue,
        isAgreePersonalInformation: nextValue,
        isAgreeReceiveMarketing: nextValue,
      });
    }, [isAllTermsChecked]);

    const passwordsMatch = password === passwordConfirm;
    const isSignupValid =
      validatePassword(password) === null && passwordsMatch && passwordConfirm.length > 0;

    const renderContent = () => {
      switch (step) {
        case 'email':
          return (
            <View className='gap-[16px]'>
              <Text className='text-20b text-gray-800'>이메일을 입력해주세요</Text>
              <View className='gap-[8px]'>
                <BottomSheetTextInput
                  className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] text-[16px]'
                  placeholder='example@email.com'
                  placeholderTextColor={colors['gray-400']}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
                {error && <Text className='text-14r text-red-500'>{error}</Text>}
              </View>
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  isLoading || !email.trim() ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={isLoading || !email.trim()}
                onPress={handleEmailSubmit}>
                {isLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>다음</Text>
                )}
              </AnimatedPressable>
            </View>
          );

        case 'login':
          return (
            <View className='gap-[16px]'>
              <View>
                <Text className='text-20b text-gray-800'>비밀번호를 입력해주세요</Text>
                <Text className='text-14r mt-[4px] text-gray-600'>{email}</Text>
              </View>
              <View className='gap-[8px]'>
                <View className='relative'>
                  <BottomSheetTextInput
                    className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] pr-[48px] text-[16px]'
                    placeholder='비밀번호'
                    placeholderTextColor={colors['gray-400']}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <AnimatedPressable
                    className='absolute top-[14px] right-[12px]'
                    onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOffIcon size={20} color={colors['gray-500']} />
                    ) : (
                      <EyeIcon size={20} color={colors['gray-500']} />
                    )}
                  </AnimatedPressable>
                </View>
                {error && <Text className='text-14r text-red-500'>{error}</Text>}
              </View>
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  isLoading || !password ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={isLoading || !password}
                onPress={handleLoginSubmit}>
                {isLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>로그인</Text>
                )}
              </AnimatedPressable>
              <AnimatedPressable className='items-center py-[8px]' onPress={goToForgotPassword}>
                <Text className='text-14m text-gray-600'>비밀번호를 잊으셨나요?</Text>
              </AnimatedPressable>
            </View>
          );

        case 'terms':
          return (
            <View className='gap-[12px]'>
              <Text className='text-20b text-gray-800'>약관에 동의해주세요</Text>
              <TermsRow
                checked={isAllTermsChecked}
                onToggle={toggleAllTerms}
                label='모두 동의합니다.'
                isBold
                className='bg-gray-200 py-[16px]'
              />
              <TermsRow
                checked={termsAgreement.isGteFourteen}
                onToggle={() => toggleTerm('isGteFourteen')}
                label='만 14세 이상입니다.'
                description='만 14세 미만은 서비스 정책에 따라 회원가입이 제한됩니다.'
              />
              <TermsRow
                checked={termsAgreement.isAgreeServiceUsage}
                onToggle={() => toggleTerm('isAgreeServiceUsage')}
                label='(필수) 서비스 이용약관 동의'
                withChevron
              />
              <TermsRow
                checked={termsAgreement.isAgreePersonalInformation}
                onToggle={() => toggleTerm('isAgreePersonalInformation')}
                label='(필수) 개인정보 수집 및 이용 필수동의'
                withChevron
              />
              <TermsRow
                checked={termsAgreement.isAgreeReceiveMarketing}
                onToggle={() => toggleTerm('isAgreeReceiveMarketing')}
                label='(선택) 마케팅 정보 수신 동의'
                withChevron
              />
              <AnimatedPressable
                className={`mt-[8px] items-center justify-center rounded-[12px] py-[14px] ${
                  isRequiredTermsChecked ? 'bg-primary-500' : 'bg-primary-200'
                }`}
                disabled={!isRequiredTermsChecked}
                onPress={handleTermsConfirm}>
                <Text className='text-16sb text-white'>다음</Text>
              </AnimatedPressable>
            </View>
          );

        case 'signup':
          return (
            <View className='gap-[16px]'>
              <View>
                <Text className='text-20b text-gray-800'>비밀번호를 설정해주세요</Text>
                <Text className='text-14r mt-[4px] text-gray-600'>{email}</Text>
              </View>
              <View className='gap-[8px]'>
                <View className='relative'>
                  <BottomSheetTextInput
                    className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] pr-[48px] text-[16px]'
                    placeholder='비밀번호 (8자 이상)'
                    placeholderTextColor={colors['gray-400']}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <AnimatedPressable
                    className='absolute top-[14px] right-[12px]'
                    onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOffIcon size={20} color={colors['gray-500']} />
                    ) : (
                      <EyeIcon size={20} color={colors['gray-500']} />
                    )}
                  </AnimatedPressable>
                </View>
                <BottomSheetTextInput
                  className={`rounded-[12px] border bg-white px-[16px] py-[14px] text-[16px] ${
                    passwordConfirm && !passwordsMatch ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='비밀번호 확인'
                  placeholderTextColor={colors['gray-400']}
                  secureTextEntry={!showPassword}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  editable={!isLoading}
                />
                {passwordConfirm && !passwordsMatch && (
                  <Text className='text-14r text-red-500'>비밀번호가 일치하지 않습니다.</Text>
                )}
                {error && <Text className='text-14r text-red-500'>{error}</Text>}
              </View>
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  isLoading || !isSignupValid ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={isLoading || !isSignupValid}
                onPress={handleSignupSubmit}>
                {isLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>회원가입</Text>
                )}
              </AnimatedPressable>
            </View>
          );

        case 'forgot-email':
          return (
            <View className='gap-[16px]'>
              <View>
                <Text className='text-20b text-gray-800'>비밀번호 찾기</Text>
                <Text className='text-14r mt-[4px] text-gray-600'>
                  {email}로 인증 코드를 보내드립니다.
                </Text>
              </View>
              {resetError && <Text className='text-14r text-red-500'>{resetError}</Text>}
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  resetLoading ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={resetLoading}
                onPress={handleSendResetCode}>
                {resetLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>인증 코드 받기</Text>
                )}
              </AnimatedPressable>
            </View>
          );

        case 'forgot-code':
          return (
            <View className='gap-[16px]'>
              <View>
                <Text className='text-20b text-gray-800'>인증 코드 입력</Text>
                <Text className='text-14r mt-[4px] text-gray-600'>
                  {email}로 전송된 인증 코드를 입력해주세요.
                </Text>
              </View>
              <View className='gap-[8px]'>
                <BottomSheetTextInput
                  className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] text-[16px]'
                  placeholder='인증 코드'
                  placeholderTextColor={colors['gray-400']}
                  keyboardType='number-pad'
                  value={resetCode}
                  onChangeText={setResetCode}
                  editable={!resetLoading}
                />
                {resetError && <Text className='text-14r text-red-500'>{resetError}</Text>}
              </View>
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  resetLoading || !resetCode ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={resetLoading || !resetCode}
                onPress={handleVerifyCode}>
                {resetLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>확인</Text>
                )}
              </AnimatedPressable>
              <AnimatedPressable className='items-center py-[8px]' onPress={handleSendResetCode}>
                <Text className='text-14m text-gray-600'>인증 코드 다시 받기</Text>
              </AnimatedPressable>
            </View>
          );

        case 'forgot-reset':
          return (
            <View className='gap-[16px]'>
              <Text className='text-20b text-gray-800'>새 비밀번호 설정</Text>
              <View className='gap-[8px]'>
                <View className='relative'>
                  <BottomSheetTextInput
                    className='rounded-[12px] border border-gray-300 bg-white px-[16px] py-[14px] pr-[48px] text-[16px]'
                    placeholder='새 비밀번호 (8자 이상)'
                    placeholderTextColor={colors['gray-400']}
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!resetLoading}
                  />
                  <AnimatedPressable
                    className='absolute top-[14px] right-[12px]'
                    onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOffIcon size={20} color={colors['gray-500']} />
                    ) : (
                      <EyeIcon size={20} color={colors['gray-500']} />
                    )}
                  </AnimatedPressable>
                </View>
                {resetError && <Text className='text-14r text-red-500'>{resetError}</Text>}
              </View>
              <AnimatedPressable
                className={`items-center justify-center rounded-[12px] py-[14px] ${
                  resetLoading || !newPassword ? 'bg-primary-200' : 'bg-primary-500'
                }`}
                disabled={resetLoading || !newPassword}
                onPress={handleResetPassword}>
                {resetLoading ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-16sb text-white'>비밀번호 변경</Text>
                )}
              </AnimatedPressable>
            </View>
          );
      }
    };

    const showBackButton = step !== 'email';

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        enableOverDrag={false}
        enableHandlePanningGesture={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ display: 'none' }}
        onChange={handleSheetChange}
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        android_keyboardInputMode='adjustResize'>
        <BottomSheetView
          className='bg-white pt-[4px] pb-[12px]'
          style={{ paddingBottom: bottomInset + 12 }}>
          <Container>
            {showBackButton && (
              <AnimatedPressable
                className='mb-[8px] flex-row items-center gap-[4px] py-[8px]'
                onPress={handleBack}>
                <ChevronLeftIcon size={20} color={colors['gray-700']} />
                <Text className='text-14m text-gray-700'>뒤로</Text>
              </AnimatedPressable>
            )}
            {renderContent()}
          </Container>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

// 약관 동의 Row 컴포넌트
type TermsRowProps = {
  checked: boolean;
  label: string;
  description?: string;
  withChevron?: boolean;
  isBold?: boolean;
  onToggle: () => void;
  className?: string;
};

const TermsRow = ({
  checked,
  label,
  description,
  withChevron,
  isBold,
  onToggle,
  className,
}: TermsRowProps) => {
  return (
    <AnimatedPressable
      className={`flex-row items-center justify-between rounded-[14px] px-[18px] py-[14px] ${className ?? ''}`}
      accessibilityRole='checkbox'
      accessibilityState={{ checked }}
      onPress={onToggle}
      disableScale>
      <View className='flex-1 flex-row gap-[10px]'>
        <View
          className={`size-[24px] items-center justify-center rounded-[6px] border ${
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
    </AnimatedPressable>
  );
};

EmailAuthSheet.displayName = 'EmailAuthSheet';

export default EmailAuthSheet;
