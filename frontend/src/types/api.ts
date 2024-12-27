// src/types/api.ts の修正
export interface APIError {
  message: string;
  details?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;  // null を許容するように変更
  message?: string;
  error?: string;  // エラー18を解決
}