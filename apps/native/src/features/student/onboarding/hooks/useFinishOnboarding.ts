import { useRef, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';

import postRegister from '@apis/controller/student/auth/postRegister';
import { TanstackQueryClient } from '@apis/client';
import { postMockExam } from '@apis/controller/student/mockExam';
import type { components } from '@schema';
import { useAuthStore } from '@stores';
import { useSignupStore } from '@features/auth/signup/store/useSignupStore';

import { showToast } from '../../scrap/components/Notification';
import { useOnboardingStore } from '../store/useOnboardingStore';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

type FinishArgs = {
  incorrects: number[];
  question: string;
};

const REGISTER_FAIL_MESSAGE = '회원가입 처리에 실패했어요. 잠시 후 다시 시도해 주세요';
const TYPE_NULL_MESSAGE = '모의고사 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요';
const MOCK_EXAM_FAIL_MESSAGE = '모의고사 정보 저장에 실패했어요. 잠시 후 다시 시도해 주세요';
const FINISH_FAIL_MESSAGE = '온보딩 처리에 실패했어요. 잠시 후 다시 시도해 주세요';

const useFinishOnboarding = (args?: FinishArgs) => {
  const navigation = useNavigation();
  const [isPending, setIsPending] = useState(false);
  const submitLockRef = useRef(false);

  const getPayload = useOnboardingStore((state) => state.getPayload);
  const isRegistered = useOnboardingStore((state) => state.isRegistered);
  const markRegistered = useOnboardingStore((state) => state.markRegistered);
  const currentMockExamType = useOnboardingStore((state) => state.currentMockExamType);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const step1Data = useSignupStore((state) => state.step1Data);
  const updateStudentProfile = useAuthStore((state) => state.updateStudentProfile);

  const { refetch: refetchCurrentMockExamType } = TanstackQueryClient.useQuery(
    'get',
    '/api/student/mock-exam/current-type',
    {},
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  const submit = async (): Promise<{ ok: boolean }> => {
    if (submitLockRef.current) return { ok: false };
    submitLockRef.current = true;
    setIsPending(true);
    try {
      const onboardingPayload = getPayload();

      const registerData: StudentInitialRegisterReq = {
        isGteFourteen: step1Data.terms.isGteFourteen,
        isAgreeServiceUsage: step1Data.terms.isAgreeServiceUsage,
        isAgreePersonalInformation: step1Data.terms.isAgreePersonalInformation,
        isAgreeReceiveMarketing: step1Data.terms.isAgreeReceiveMarketing,
        email: step1Data.email || undefined,
        name: step1Data.name,
        phoneNumber: step1Data.phoneNumber || undefined,
        grade: onboardingPayload.grade ?? 'ONE',
        selectSubject: onboardingPayload.selectSubject ?? undefined,
        schoolId: onboardingPayload.schoolId ?? undefined,
      };

      if (!isRegistered) {
        const { data: regData, error: regErr } = await postRegister(registerData);

        if (regErr || !regData) {
          showToast('error', REGISTER_FAIL_MESSAGE);
          return { ok: false };
        }

        await updateStudentProfile({
          name: step1Data.name || null,
          grade: onboardingPayload.grade,
        });
        markRegistered();
      }

      if (args) {
        if (!currentMockExamType?.type) {
          showToast('error', TYPE_NULL_MESSAGE);
          refetchCurrentMockExamType();
          return { ok: false };
        }

        const { error: mockExamErr } = await postMockExam({
          type: currentMockExamType.type,
          incorrects: args.incorrects,
          question: args.question.length > 0 ? JSON.stringify({ data: args.question }) : undefined,
        });

        if (mockExamErr) {
          showToast('error', MOCK_EXAM_FAIL_MESSAGE);
          return { ok: false };
        }
      }

      setCurrentStep('Welcome');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        })
      );
      return { ok: true };
    } catch (error) {
      console.error('[useFinishOnboarding] finish failed:', error);
      showToast('error', FINISH_FAIL_MESSAGE);
      return { ok: false };
    } finally {
      submitLockRef.current = false;
      setIsPending(false);
    }
  };

  return { submit, isPending };
};

export default useFinishOnboarding;
