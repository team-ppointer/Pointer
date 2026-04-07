export function formatToMinute(date: Date, locale: string = 'ko-KR'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (locale === 'ko-KR') {
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${year}-${month}-${day} ${period} ${hour12}:${minutes}`;
  }

  // 기본 fallback (다른 로케일일 경우)
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
