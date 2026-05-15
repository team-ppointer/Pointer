import type { components } from '@schema';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

export type GradeValue = NonNullable<StudentInitialRegisterReq['grade']>;
export type MathSubjectValue = NonNullable<StudentInitialRegisterReq['selectSubject']>;
export type CarrierValue = NonNullable<StudentInitialRegisterReq['mobileCarrier']>;
export type GenderValue = NonNullable<StudentInitialRegisterReq['gender']>;

export const gradeOptions: { value: GradeValue; label: string }[] = [
  { value: 'ONE', label: '1학년' },
  { value: 'TWO', label: '2학년' },
  { value: 'THREE', label: '3학년' },
  { value: 'N_TIME', label: 'N수생' },
];

export const mathSubjectOptions: { value: MathSubjectValue; label: string }[] = [
  { value: 'MIJUKBUN', label: '미적분' },
  { value: 'HWAKTONG', label: '확률과 통계' },
  { value: 'KEEHA', label: '기하' },
];

export const carrierOptions: { value: CarrierValue; label: string }[] = [
  { value: 'SKT', label: 'SKT' },
  { value: 'KT', label: 'KT' },
  { value: 'LG', label: 'LG U+' },
  { value: 'SKT_MVNO', label: '알뜰폰' },
];
