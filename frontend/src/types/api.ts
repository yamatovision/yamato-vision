export interface APIError {
  message: string;
  details?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
