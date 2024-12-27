export interface WeeklyRankingUser {
  id: string;
  name: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  experience: number;
  rank: string;
}

export interface HomePageData {
  profile: {
    id: string;
    name: string | null;
    nickname: string | null;
    rank: string;
    level: number;
    experience: number;
    gems: number;
    avatarUrl: string | null;
    message: string | null;
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
    startedAt: Date | null;
    timeLimit: number | null;
    chapters: Array<{
      id: string;
      orderIndex: number;
      title: string;
    }>;
  };
  weeklyRanking: WeeklyRankingUser[];
  notifications: [];
  events: [];
}
