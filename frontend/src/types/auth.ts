export type UserRank = 'お試し' | '退会者' | '初伝' | '中伝' | '奥伝' | '皆伝' | '管理者';

export interface User {
  id: string;
  email: string;
  name?: string;          // nameをオプショナルに変更
  rank: UserRank;
  mongoId?: string;       // mongoIdもオプショナルに変更
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
