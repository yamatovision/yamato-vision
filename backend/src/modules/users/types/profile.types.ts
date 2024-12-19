import { UserStatus } from '@prisma/client';

export type SnsLink = {
  type: 'twitter' | 'line' | 'tiktok';
  value: string;
};

export type Badge = {
  id: string;
  title: string;
  iconUrl: string;
};

export type ProfileUpdateData = {
  nickname?: string;
  message?: string;
  snsLinks?: SnsLink[];
  avatarFile?: Express.Multer.File;
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
  snsLinks: SnsLink[] | null;
  avatarUrl: string | null;
  badges: Badge[];
  status: UserStatus;
  mongoId: string | null;  // MongoDBとの紐付け用ID
};

export interface ProfileServiceInterface {
  getProfile(userId: string): Promise<ProfileResponse>;
  updateProfile(
    userId: string, 
    data: ProfileUpdateData, 
    avatarFile?: Express.Multer.File
  ): Promise<ProfileResponse>;
}
