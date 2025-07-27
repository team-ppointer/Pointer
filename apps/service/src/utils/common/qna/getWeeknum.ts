export const getWeekNum = (dateStr: string): string => {
  const date = new Date(dateStr);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1); // 그 달의 1일
  const firstDayWeekday = firstDay.getDay() || 7; // 일요일(0)은 7로
  const currentDate = date.getDate();

  const weekNumber = Math.ceil((currentDate + firstDayWeekday - 1) / 7);

  return `${weekNumber}주차`;
};

export const formatDateToSlash = (dateStr: string): string => {
  return dateStr.replace(/-/g, '/');
};
