import { UserStatus } from '@prisma/client';

export interface AdminUserSearchParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminUserBadge {
  id: string;
  title: string;
  iconUrl: string;
  earnedAt: Date;
}

export interface AdminUserData {
  id: string;
  email: string;
  name: string | null;
  rank: string;
  level: number;
  experience: number;
  gems: number;
  status: UserStatus;
  badges: AdminUserBadge[];
}

export interface AdminUserListResponse {
  users: AdminUserData[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface AdminUserUpdateParams {
  status?: UserStatus;
  gems?: number;
  badgeIds?: string[];
}
