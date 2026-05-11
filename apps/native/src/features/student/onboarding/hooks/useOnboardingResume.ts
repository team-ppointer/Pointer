import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { OnboardingStackParamList } from '../screens/types';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { getStepSequence } from '../utils';

/**
 * 앱 종료 후 재진입 시, persist된 currentStep까지의 stack을 복원하여
 * 사용자가 뒤로가기로 이전 step에 돌아갈 수 있게 한다.
 *
 * GradeStep(resume route) mount 시 호출되어, currentTypeStatus가 'resolved' 또는
 * 'error'로 판정된 직후 한 번만 `navigation.reset`을 발화한다.
 */
const useOnboardingResume = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const status = useOnboardingStore((state) => state.status);
  const grade = useOnboardingStore((state) => state.grade);
  const currentMockExamType = useOnboardingStore((state) => state.currentMockExamType);
  const currentTypeStatus = useOnboardingStore((state) => state.currentTypeStatus);

  const resumeStepRef = useRef(useOnboardingStore.getState().currentStep);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    if (status !== 'in-progress') return;
    const resumeStep = resumeStepRef.current;
    if (resumeStep === 'Grade' || resumeStep === 'Welcome') return;
    if (currentTypeStatus !== 'resolved' && currentTypeStatus !== 'error') return;

    const hasActiveMockExam =
      currentTypeStatus === 'resolved' && Boolean(currentMockExamType?.type);
    const sequence = getStepSequence(grade, hasActiveMockExam);
    const targetStep =
      resumeStep === 'MockExam' && !hasActiveMockExam ? sequence[sequence.length - 1] : resumeStep;
    const idx = sequence.indexOf(targetStep);
    if (idx <= 0) return;

    restoredRef.current = true;
    navigation.reset({
      index: idx,
      routes: sequence.slice(0, idx + 1).map((name) => ({ name })),
    });
  }, [status, grade, currentMockExamType, currentTypeStatus, navigation]);
};

export default useOnboardingResume;
