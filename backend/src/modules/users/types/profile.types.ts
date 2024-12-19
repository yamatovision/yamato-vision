export type ProfileUpdateData = {
  nickname?: string;
  message?: string;
  snsLinks?: {
    twitter?: string;
    line?: string;
    tiktok?: string;
  };
  isRankingVisible?: boolean;
  isProfileVisible?: boolean;
};

export type ProfileResponse = {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  level: number;
  experience: number;
  rank: string;
  gems: number;
  message: string | null;
  snsLinks: any | null;
  isRankingVisible: boolean;
  isProfileVisible: boolean;
  status: string;
};

export interface ProfileServiceInterface {
  getProfile(userId: string): Promise<ProfileResponse>;
  updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfileResponse>;
  syncWithMongo(userId: string): Promise<void>;
}
