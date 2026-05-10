import type { GradeValue } from './constants';

export const getOnboardingTotal = (grade: GradeValue | null, hasActiveType: boolean): number => {
  if (grade === 'THREE') return hasActiveType ? 4 : 3;
  return hasActiveType ? 3 : 2;
};
