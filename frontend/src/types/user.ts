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
  // トークン関連の追加
  weeklyTokens: number;       // 週間トークン残量
  unprocessedTokens: number;  // 未処理トークン量
}