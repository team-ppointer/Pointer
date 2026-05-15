/**
 * 공지: 항상 "M월 d일" (시간 정보 없음)
 * yyyy-MM-dd 형식은 new Date()가 UTC로 파싱하므로 수동 파싱
 */
export const formatNoticeDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * 알림: 오늘이면 "오늘 HH:mm", 아니면 "M월 d일"
 */
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};
