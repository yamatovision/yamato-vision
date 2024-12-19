import { UserStatus } from '@prisma/client';

export interface UserDetails {
  id: string;
  email: string;
  nickname: string | null;
  rank: string;
  level: number;
  experience: number;
  gems: number;
  status: UserStatus;  // Prismaの列挙型を使用
  badges: {
    badge: {
      id: string;
      title: string;
      iconUrl: string;
    };
    earnedAt: Date;
  }[];
  mongoData?: {
    registrationDate: Date;
    lastLoginDate?: Date;
    totalConversations: number;
  };
}

// ユーザー一覧用の型も追加
export interface UserListResponse {
  users: UserDetails[];
  total: number;
  pages: number;
  currentPage: number;
}
