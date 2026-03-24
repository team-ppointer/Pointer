import { type ComponentType } from 'react';

import { type components } from '@schema';

export type PublishResp = components['schemas']['PublishResp'];
export type CalendarProgress = 'completed' | 'inprogress' | 'notstarted' | 'unavailable';

export interface CalendarCell {
  key: string;
  date: Date;
  label: number;
  progress: CalendarProgress;
  isSelected: boolean;
  disabled: boolean;
}

export interface CalendarDateProps {
  date: number;
  dayOfWeek: number;
  progress: CalendarProgress;
  isSelected?: boolean;
  disabled?: boolean;
}

export type CalendarProgressIconMap = Record<CalendarProgress, ComponentType>;
