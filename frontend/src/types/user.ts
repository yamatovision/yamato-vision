export interface UserTokens {
  weeklyTokens: number;     // 週間使用量
  weeklyLimit: number;      // 基本制限
  purchasedTokens: number;  // 購入済みトークン
  unprocessedTokens: number;// 経験値未換算分
}

export interface Badge {
  id: string;
  title: string;
  iconUrl: string;
}

export interface User {
  id: string;
  name: string;
  nickname?: string;
  rank: string;
  level: number;
  experience: number;
  gems: number;
  avatarUrl?: string;
  message?: string;
  snsLinks: {
    [key: string]: string;
  };
  badges: Badge[];
  tokens?: UserTokens;
}

// APIレスポンス用の型も定義
export interface UserResponse {
  data: User;
  success: boolean;
  message?: string;
}
