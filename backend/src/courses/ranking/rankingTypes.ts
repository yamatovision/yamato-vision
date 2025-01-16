export interface RankingUser {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  rank: string;
  averageScore: number;
  submissionCount: number;
}

export interface CourseRankingResponse {
  activeUsers: RankingUser[];
  historicalUsers: RankingUser[];
  activeUserCount: number;
}