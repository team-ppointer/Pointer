import type { components } from '@schema';

type StudentInitialRegisterReq = components['schemas']['StudentInitialRegisterDTO.Req'];

export type GradeValue = NonNullable<StudentInitialRegisterReq['grade']>;
export type MathSubjectValue = NonNullable<StudentInitialRegisterReq['selectSubject']>;
export type CarrierValue = NonNullable<StudentInitialRegisterReq['mobileCarrier']>;
export type GenderValue = NonNullable<StudentInitialRegisterReq['gender']>;

export const gradeOptions: Array<{ value: GradeValue; label: string }> = [
  { value: 'ONE', label: '1학년' },
  { value: 'TWO', label: '2학년' },
  { value: 'THREE', label: '3학년' },
  { value: 'N_TIME', label: 'N수생' },
];

export const mathSubjectOptions: Array<{ value: MathSubjectValue; label: string }> = [
  { value: 'MIJUKBUN', label: '미적분' },
  { value: 'HWAKTONG', label: '확률과 통계' },
  { value: 'KEEHA', label: '기하' },
];

export const carrierOptions: Array<{ value: CarrierValue; label: string }> = [
  { value: 'SKT', label: 'SKT' },
  { value: 'KT', label: 'KT' },
  { value: 'LG', label: 'LG U+' },
  { value: 'SKT_MVNO', label: '알뜰폰' },
];

export const levelOptions: Array<{ value: number; label: string }> = [
  { value: 1, label: '1등급' },
  { value: 2, label: '2등급' },
  { value: 3, label: '3등급' },
  { value: 4, label: '4등급' },
  { value: 5, label: '5등급' },
  { value: 6, label: '6등급' },
  { value: 7, label: '7등급' },
  { value: 8, label: '8등급' },
  { value: 9, label: '9등급' },
];
