export interface AdminUser {
  id: string;
  email: string;
  name: string;
  rank: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENALTY';
  gems: number;
  badges: Badge[];
  mongoInfo?: {
    registrationDate: Date;
    lastLoginDate?: Date;
    totalConversations: number;
  };
}

export interface Badge {
  id: string;
  title: string;
  iconUrl: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: PaginationData;
  };
}
// types/admin.ts に追加
export interface LevelMessage {
  id: string;
  level: number;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LevelMessageResponse {
  success: boolean;
  data: LevelMessage | LevelMessage[];
  message?: string;
}