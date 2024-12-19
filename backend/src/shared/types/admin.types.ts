export interface UserDetails {
  id: string;
  email: string;
  nickname: string | null;  // undefinedからnullに変更
  rank: string;
  level: number;
  experience: number;
  gems: number;
  status: 'ACTIVE' | 'INACTIVE';
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
