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
    rank: string;
    mongoId: string | null;
  };
}
export class AuthService {
  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return {
          success: false,
          message: 'ユーザーが見つかりません'
        };
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'パスワードが正しくありません'
        };
      }
      if (user.status === 'INACTIVE' || user.rank === '退会者') {
        return {
          success: false,
          message: 'このアカウントは退会済みです'
        };
      }
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
        id: user.id,          // userIdからidに変更
        email: user.email,
        rank: user.rank,
        mongoId: user.mongoId,
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
