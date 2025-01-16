export interface ProfileUpdateParams {
  nickname?: string;
  avatarUrl?: string;
  message?: string;
  snsLinks?: Record<string, string>;
  isRankingVisible?: boolean;
  isProfileVisible?: boolean;
  careerIdentity?: string;    // 追加
}

export interface ExpStatus {
  currentExp: number;          // 現在の累計経験値
  currentLevelExp: number;     // 現在レベルでの経験値
  expToNextLevel: number;      // 次のレベルまでに必要な経験値
  remainingExp: number;        // レベルアップまでの残り経験値
  levelProgress: number;       // 現在レベルでの進捗率
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
  careerIdentity: string | null;  // 追加
  studentId: string | null;  // 追加：学籍番号フィールド
  expGained?: number;
  levelUpData?: {
    oldLevel: number;
    newLevel: number;
    message: string | null;
  };  // セミコロンを追加
  shouldShowExpNotification?: boolean;
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
  tokens?: {
    weeklyTokens: number;
    weeklyLimit: number;
    purchasedTokens: number;
    unprocessedTokens: number;
  } | null;
  expStatus: ExpStatus;  // 追加
}

export interface ProfileListResponse {
  success: boolean;
  data: ProfileResponse;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data: ProfileResponse;
}
