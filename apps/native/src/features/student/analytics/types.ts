import { type components } from '@/types/api/schema';

// Event types from API schema
export type EventType = components['schemas']['UserEventRequest']['eventType'];

// Screen names for analytics
export type ScreenName =
  | 'Main'
  | 'StudyList'
  | 'StudyDetail'
  | 'Problem'
  | 'Pointing'
  | 'Scrap'
  | 'ScrapDetail'
  | 'QnA'
  | 'QnAChat'
  | 'Notification'
  | 'Settings'
  | 'Profile';

// Button IDs for analytics
export type ButtonId =
  | 'start_study'
  | 'view_scrap'
  | 'view_qna'
  | 'submit_answer'
  | 'next_problem'
  | 'prev_problem'
  | 'confirm_pointing'
  | 'reject_pointing'
  | 'add_scrap'
  | 'remove_scrap'
  | 'send_message'
  | 'upload_image';

// Exit reasons for SCREEN_EXIT
export type ScreenExitReason = 'navigation' | 'back' | 'background' | 'timeout';

// Exit reasons for STUDY_END
export type StudyExitReason = 'completed' | 'paused' | 'abandoned';

// Device type
export type DeviceType = 'TABLET' | 'MOBILE' | 'DESKTOP' | 'UNKNOWN';

// Event metadata types
export interface BaseMetadata {
  [key: string]: unknown;
}

export interface ScreenEnterMetadata extends BaseMetadata {
  screenName: ScreenName;
  previousScreen?: ScreenName;
  params?: Record<string, unknown>;
}

export interface ScreenExitMetadata extends BaseMetadata {
  screenName: ScreenName;
  dwellTimeMs: number;
  nextScreen?: ScreenName;
  exitReason?: ScreenExitReason;
}

export interface ButtonClickMetadata extends BaseMetadata {
  buttonId: ButtonId;
  screenName: ScreenName;
  buttonLabel?: string;
}

export interface StudyStartMetadata extends BaseMetadata {
  problemSetId: number;
  problemSetTitle?: string;
  totalProblems?: number;
}

export interface StudyEndMetadata extends BaseMetadata {
  problemSetId: number;
  completedCount: number;
  studyDurationMs: number;
  correctCount?: number;
  exitReason?: StudyExitReason;
}

export interface ProblemViewMetadata extends BaseMetadata {
  problemId: number;
  problemSetId: number;
  problemIndex?: number;
  isRetry?: boolean;
}

export interface PointingViewMetadata extends BaseMetadata {
  pointingId: number;
  problemId: number;
  pointingType?: string;
}

export interface SessionStartMetadata extends BaseMetadata {
  appVersion?: string;
  osVersion?: string;
}

export interface SessionEndMetadata extends BaseMetadata {
  sessionDurationMs?: number;
}

// Union type for all metadata
export type EventMetadata =
  | ScreenEnterMetadata
  | ScreenExitMetadata
  | ButtonClickMetadata
  | StudyStartMetadata
  | StudyEndMetadata
  | ProblemViewMetadata
  | PointingViewMetadata
  | SessionStartMetadata
  | SessionEndMetadata
  | BaseMetadata;

// Internal event representation
export interface AnalyticsEvent {
  eventType: EventType;
  occurredAt: string;
  metadata: EventMetadata;
}

// Device info for initialization
export interface DeviceInfo {
  deviceType: DeviceType;
  appVersion?: string;
  osVersion?: string;
}
