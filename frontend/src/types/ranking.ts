
// ランキング関連の型定義
export interface CourseRankingUser {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  rank: string;
  averageScore: number;
  submissionCount: number;
}

export interface RankingUser {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  rank: string;
  averageScore: number;
  submissionCount: number;
}


export interface CourseRankingResponse {
  activeUsers: CourseRankingUser[];
  historicalUsers: CourseRankingUser[];
  activeUserCount: number;
}



