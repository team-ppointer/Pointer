import type { GradeValue } from './constants';
import type { OnboardingStep } from './screens/types';

export const getStepSequence = (
  grade: GradeValue | null,
  hasActiveType: boolean
): OnboardingStep[] => {
  const sequence: OnboardingStep[] = ['Grade'];
  if (grade === 'THREE' || grade === 'N_TIME') sequence.push('MathSubject');
  if (grade !== 'N_TIME') sequence.push('School');
  if (hasActiveType) sequence.push('MockExam');
  return sequence;
};

export const getOnboardingTotal = (grade: GradeValue | null, hasActiveType: boolean): number =>
  getStepSequence(grade, hasActiveType).length;
