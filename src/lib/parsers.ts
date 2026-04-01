export const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const parsed =
    typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = toOptionalNumber(value);
  return parsed ?? fallback;
};

export const toDateOrNow = (value: unknown): Date => {
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};
