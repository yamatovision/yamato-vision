// src/types/user.ts を更新
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
  badges: Array<{
    id: string;
    title: string;
    iconUrl: string;
  }>;
  tokens?: {
    weeklyTokens: number;     // 週間使用量
    weeklyLimit: number;      // 基本制限
    purchasedTokens: number;  // 購入済みトークン
    unprocessedTokens: number;// 経験値未換算分
  };
}