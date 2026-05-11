type ErrorPayload = {
  message?: unknown;
  code?: unknown;
  error?: unknown;
  response?: {
    data?: unknown;
  };
};

const isRecord = (value: unknown): value is ErrorPayload => {
  return !!value && typeof value === 'object';
};

const getErrorPayload = (error: unknown): unknown => {
  if (!isRecord(error)) return error;
  return error.response?.data ?? error;
};

const getNestedErrorPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) return payload;
  return payload.error ?? payload;
};

export const extractErrorMessage = (error: unknown): string => {
  const fallback = '요청에 실패했습니다';

  const payload = getNestedErrorPayload(getErrorPayload(error));
  if (!isRecord(payload)) return fallback;

  const maybeMessage = payload.message;
  if (typeof maybeMessage === 'string' && maybeMessage.length > 0) return maybeMessage;
  return fallback;
};

export const getErrorCode = (error: unknown): string | undefined => {
  const payload = getNestedErrorPayload(getErrorPayload(error));
  if (!isRecord(payload)) return undefined;

  const code = payload.code;
  return typeof code === 'string' ? code : undefined;
};
