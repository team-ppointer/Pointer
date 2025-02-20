import { z } from 'zod';

export type TagType = { id: number; name: string };

export type ExamType = { id: number; name: string };

export const problemTypeSchema = z.enum(['CREATION_PROBLEM', 'GICHUL_PROBLEM', 'VARIANT_PROBLEM']);
export type ProblemType = z.infer<typeof problemTypeSchema>;

export type ProblemAnswerType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';

export type LevelType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ImageType =
  | 'MAIN_PROBLEM'
  | 'MAIN_ANALYSIS'
  | 'MAIN_HANDWRITING_EXPLANATION'
  | 'READING_TIP'
  | 'SENIOR_TIP'
  | 'PRESCRIPTION'
  | 'CHILD_PROBLEM';
