import {
  CalendarCompletedIcon,
  CalendarInProgressIcon,
  CalendarNotStartedIcon,
  CalendarUnavailableIcon,
} from '@components/system/icons';

import { type CalendarProgress, type CalendarProgressIconMap, type PublishResp } from './types';

export const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const CalendarProgressIcon: CalendarProgressIconMap = {
  completed: CalendarCompletedIcon,
  inprogress: CalendarInProgressIcon,
  notstarted: CalendarNotStartedIcon,
  unavailable: CalendarUnavailableIcon,
};

export const publishProgressMap: Record<PublishResp['progress'], CalendarProgress> = {
  DONE: 'completed',
  DOING: 'inprogress',
  NONE: 'notstarted',
};

/** Calendar cell layout dimensions */
export const CELL_WIDTH = 52;
export const CELL_HEIGHT = 64;
export const CELL_DATE_HEIGHT = 30;
export const CELL_ICON_SIZE = 36;
export const CELL_BORDER_WIDTH = 1;
/** CELL_HEIGHT + CELL_BORDER_WIDTH * 2 + shadow overflow margin */
export const CELL_ROW_HEIGHT = CELL_HEIGHT + CELL_BORDER_WIDTH * 2;
