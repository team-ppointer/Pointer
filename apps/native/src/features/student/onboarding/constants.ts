export type GradeValue = 'grade1' | 'grade2' | 'grade3' | 'nStudent';

export type MathSubjectValue = '미적분' | '확률과 통계' | '기하';

export type CarrierOption = 'SKT' | 'KT' | 'LG U+' | '알뜰폰';

export type ScoreValue =
  | '1등급'
  | '2등급'
  | '3등급'
  | '4등급'
  | '5등급'
  | '6등급'
  | '7등급'
  | '8등급'
  | '9등급';

export type SchoolOption = {
  id: string;
  name: string;
  region: string;
};

export const gradeOptions: Array<{ value: GradeValue; label: string }> = [
  { value: 'grade1', label: '1학년' },
  { value: 'grade2', label: '2학년' },
  { value: 'grade3', label: '3학년' },
  { value: 'nStudent', label: 'N수생' },
];

export const mathSubjectOptions: Array<{ value: MathSubjectValue; label: string }> = [
  { value: '미적분', label: '미적분' },
  { value: '확률과 통계', label: '확률과 통계' },
  { value: '기하', label: '기하' },
];

export const carrierOptions: CarrierOption[] = ['SKT', 'KT', 'LG U+', '알뜰폰'];

export const scoreOptions: ScoreValue[] = [
  '1등급',
  '2등급',
  '3등급',
  '4등급',
  '5등급',
  '6등급',
  '7등급',
  '8등급',
  '9등급',
];

export const schoolOptions: SchoolOption[] = [
  { id: 'kyunggi-seoul', name: '경기고등학교', region: '서울' },
  { id: 'hwaseong-gg', name: '화성고등학교', region: '경기' },
  { id: 'daehwa-gg', name: '대화고등학교', region: '경기' },
  { id: 'seoul-000', name: '000고등학교', region: '서울' },
  { id: 'busan-000', name: '000고등학교', region: '부산' },
  { id: 'daegu-000', name: '000고등학교', region: '대구' },
  { id: 'ulsan-000', name: '000고등학교', region: '울산' },
  { id: 'jeju-000', name: '000고등학교', region: '제주' },
];

export const duplicateEmailSamples = ['pointer111@naver.com', 'student@pointer.com'];

