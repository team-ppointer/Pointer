export type ProblemAnswerType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';

export type DailyProgress = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type ProblemStatus =
  | 'CORRECT'
  | 'INCORRECT'
  | 'RETRY_CORRECT'
  | 'IN_PROGRESS'
  | 'NOT_STARTED';

export type ChildProblemStatus = 'CORRECT' | 'INCORRECT' | 'RETRY_CORRECT' | 'NOT_STARTED';
