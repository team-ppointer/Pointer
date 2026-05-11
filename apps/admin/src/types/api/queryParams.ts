import type { paths } from '@schema';

export interface GetConceptParams {
  query?: string;
  page?: number;
  size?: number;
}

export type ConceptNodeSheetSearchOptions = NonNullable<
  paths['/api/admin/concept/graph/sheet/node']['get']['parameters']['query']
>;

export type ConceptEdgeSheetSearchOptions = NonNullable<
  paths['/api/admin/concept/graph/sheet/edge']['get']['parameters']['query']
>;

export type ActionGraphSheetSearchOptions = NonNullable<
  paths['/api/admin/concept/graph/sheet/action-edge']['get']['parameters']['query']
>;

export interface GetConceptCategoryParams {
  query?: string;
  page?: number;
  size?: number;
}

export interface GetNotificationParams {
  studentId: number;
}

export interface GetNoticeParams {
  studentId: number;
}

export interface GetNoticeAvailableParams {
  studentId: number;
}

export interface GetTeacherParams {
  query?: string;
  page?: number;
  size?: number;
}

export interface GetPracticeTestParams {
  query?: string;
  year?: number;
  month?: number;
  grade?: number;
  page?: number;
  size?: number;
}

export interface GetProblemByIdParams {
  id: number;
}

export interface GetProblemsSearchParams {
  customId?: string;
  title?: string;
  concepts?: number[];
  problemType?: 'MAIN_PROBLEM' | 'CHILD_PROBLEM';
  page?: number;
  size?: number;
}

export interface GetProblemSetByIdParams {
  id: number;
}

export interface GetProblemSetSearchParams {
  setTitle?: string;
  problemTitle?: string;
  page?: number;
  size?: number;
}

export interface GetPublishParams {
  year?: number;
  month?: number;
  studentId?: number;
}

export interface GetPublishByIdParams {
  id: number;
}

export interface GetStudentParams {
  query?: string;
  page?: number;
  size?: number;
}

export interface GetDiagnosisByIdParams {
  id: number;
}

export interface GetDiagnosisParams {
  studentId: number;
}

export interface GetDailyCommentParams {
  studentId: number;
  commentDate: string;
}

export interface GetMockExamByStudentParams {
  studentId: number;
}
