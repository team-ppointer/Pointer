const WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export const formatPublishDateLabel = (publishAt?: string) => {
  if (!publishAt) {
    return '';
  }
  const date = new Date(publishAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${month}월 ${day}일`; // ${weekday}`;
};
