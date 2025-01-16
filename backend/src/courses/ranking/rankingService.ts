import { PrismaClient } from '@prisma/client';
import { RankingUser } from './rankingTypes';

const prisma = new PrismaClient();

// データベースから返却されるユーザーデータの型定義
interface RawUserScore {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  rank: string;
  average_score: string | number;
  submission_count: string | number;
}

export class RankingService {
  async getCourseRanking(courseId: string) {
    try {
      // アクティブユーザーのランキング取得
      const activeUsers = await prisma.$queryRaw<RawUserScore[]>`
        WITH UserScores AS (
          SELECT 
            u.id as user_id,
            COALESCE(u.nickname, u.name) as display_name,
            u."avatarUrl" as avatar_url,
            u.rank,
            COALESCE(ROUND(AVG(s.points)::numeric, 2), 0) as average_score,
            COUNT(s.id)::integer as submission_count
          FROM "User" u
          LEFT JOIN "Submission" s ON s."userId" = u.id
          LEFT JOIN "Task" t ON s."taskId" = t.id
          LEFT JOIN "Chapter" c ON c."taskId" = t.id
          WHERE 
            c."courseId" = ${courseId}
            AND u.status = 'ACTIVE'
            AND s."submittedAt" >= date_trunc('week', CURRENT_TIMESTAMP)
          GROUP BY u.id, u.name, u.nickname, u."avatarUrl", u.rank
        )
        SELECT *
        FROM UserScores
        WHERE submission_count > 0
        ORDER BY average_score DESC
        LIMIT 5
      `;

      // 型安全な変換処理
      const formattedActiveUsers = activeUsers.map((user: RawUserScore): RankingUser => ({
        userId: user.user_id,
        name: user.display_name,
        avatarUrl: user.avatar_url,
        rank: user.rank,
        averageScore: Number(user.average_score),
        submissionCount: Number(user.submission_count)
      }));

      // 歴代ユーザーのランキング取得
      const historicalUsers = await prisma.$queryRaw<RawUserScore[]>`
        WITH UserScores AS (
          SELECT 
            u.id as user_id,
            COALESCE(u.nickname, u.name) as display_name,
            u."avatarUrl" as avatar_url,
            u.rank,
            COALESCE(ROUND(AVG(s.points)::numeric, 2), 0) as average_score,
            COUNT(s.id)::integer as submission_count
          FROM "User" u
          LEFT JOIN "Submission" s ON s."userId" = u.id
          LEFT JOIN "Task" t ON s."taskId" = t.id
          LEFT JOIN "Chapter" c ON c."taskId" = t.id
          WHERE 
            c."courseId" = ${courseId}
          GROUP BY u.id, u.name, u.nickname, u."avatarUrl", u.rank
        )
        SELECT *
        FROM UserScores
        WHERE submission_count > 0
        ORDER BY average_score DESC
        LIMIT 10
      `;

      // 型安全な変換処理
      const formattedHistoricalUsers = historicalUsers.map((user: RawUserScore): RankingUser => ({
        userId: user.user_id,
        name: user.display_name,
        avatarUrl: user.avatar_url,
        rank: user.rank,
        averageScore: Number(user.average_score),
        submissionCount: Number(user.submission_count)
      }));

      return {
        activeUsers: formattedActiveUsers,
        historicalUsers: formattedHistoricalUsers,
        activeUserCount: formattedActiveUsers.length
      };
    } catch (error) {
      console.error('【ランキング取得エラー】', error);
      throw error;
    }
  }
}