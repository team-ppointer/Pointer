export const extractErrorMessage = (error: unknown): string => {
  const fallback = '요청에 실패했습니다';
  if (!error || typeof error !== 'object') return fallback;
  const responseData = (error as { response?: { data?: { message?: unknown } } }).response?.data
    ?.message;
  if (typeof responseData === 'string' && responseData.length > 0) return responseData;
  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage === 'string' && maybeMessage.length > 0) return maybeMessage;
  return fallback;
};
