// /backend/src/auth/authService.ts
import { PrismaClient, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    rank: string;  // 文字列型に変更
    mongoId: string | null;
  };
}

export class AuthService {
  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // PostgreSQLでユーザー検索
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'ユーザーが見つかりません'
        };
      }

      // パスワード検証
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'パスワードが正しくありません'
        };
      }

      // ユーザーステータスチェック
      if (user.status === 'INACTIVE' || user.rank === '退会者') {  // 'TAIKEI'から'退会者'に修正
        return {
          success: false,
          message: 'このアカウントは退会済みです'
        };
      }

      // トークン生成
      const token = this.generateToken(user);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rank: user.rank,
          mongoId: user.mongoId
        }
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('認証処理中にエラーが発生しました');
    }
  }

  generateToken(user: User) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        rank: user.rank,
        mongoId: user.mongoId,
        postgresId: user.id,
        isActive: user.status === 'ACTIVE'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '336h' }
    );
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('無効なトークンです');
    }
  }
}