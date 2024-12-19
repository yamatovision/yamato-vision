interface FormatResponseSuccess<T> {
  success: true;
  message?: string;
  data?: T;
}

interface FormatResponseError {
  success: false;
  error: string;
  details?: any;
}

export type FormatResponse<T = any> = FormatResponseSuccess<T> | FormatResponseError;

export const formatResponse = <T>(
  success: boolean,
  messageOrError: string,
  data?: T
): FormatResponse<T> => {
  if (success) {
    return {
      success: true,
      message: messageOrError,
      data
    };
  }
  return {
    success: false,
    error: messageOrError
  };
};
