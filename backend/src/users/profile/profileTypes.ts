export interface ProfileUpdateParams {
  nickname?: string;
  avatarUrl?: string;
  message?: string;
  snsLinks?: Record<string, string>;
  isRankingVisible?: boolean;
  isProfileVisible?: boolean;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  rank: string;
  level: number;
  experience: number;
  gems: number;
  message: string | null;
  snsLinks: Record<string, string> | null;
  isRankingVisible: boolean;
  isProfileVisible: boolean;
  createdAt: Date;
  badges: Array<{
    id: string;
    title: string;
    iconUrl: string;
    earnedAt: Date;
  }>;
  // 追加: トークン情報
  tokens?: {
    weeklyTokens: number;
    weeklyLimit: number;
    purchasedTokens: number;
    unprocessedTokens: number;
  } | null;
}

export interface ProfileListResponse {
  success: boolean;
  data: ProfileResponse;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data: ProfileResponse;
}
