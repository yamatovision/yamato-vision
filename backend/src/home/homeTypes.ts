import { User as PrismaUser } from '@prisma/client';

export interface WeeklyRankingUser {
  id: string;
  name: string | null;  // nullを許容
  nickname: string | null;  // nullを許容
  avatarUrl: string | null;  // nullを許容
  experience: number;
  rank: string;
}

export interface Notification {
  id: string;
  title: string;
  date: Date;
  type: 'info' | 'maintenance' | 'success';
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  tag: string;
  description: string;
  status: string;
}

export interface HomePageData {
  profile: {
    id: string;
    name: string | null;  // nullを許容
    nickname?: string | null;  // nullを許容
    rank: string;
    level: number;
    experience: number;
    gems: number;
    avatarUrl?: string | null;  // nullを許容
    message?: string | null;  // nullを許容
    tokens?: {
      weeklyTokens: number;
      weeklyLimit: number;
      purchasedTokens: number;
      unprocessedTokens: number;
    };
  };
  currentCourse?: {
    id: string;
    courseId: string;
    title: string;
    progress: number;
    startedAt: Date | null;  // nullを許容
    timeLimit?: number | null;  // nullを許容
    chapters: Array<{
      id: string;
      orderIndex: number;
      title: string;
    }>;
  };
  weeklyRanking: WeeklyRankingUser[];
  notifications: Notification[];
  events: Event[];
}