import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../../config/logger';

const prisma = new PrismaClient();
const logger = createLogger('MongoSyncService');

interface SyncResult {
  success: boolean;
  message?: string;
  data?: any;
}

interface MongoUserInfo {
  registrationDate: Date;
  lastLoginDate?: Date;
  totalConversations: number;
  userRank: string;
  name?: string;
}

export class MongoSyncService {
  static async getUserInfo(email: string): Promise<MongoUserInfo | null> {
    try {
      const mongoUser = await mongoose.model('User').findOne(
        { email },
        {
          registrationDate: 1,
          lastLoginDate: 1,
          totalConversations: 1,
          userRank: 1,
          name: 1
        }
      );

      if (!mongoUser) {
        logger.warn(`MongoDB user not found for email: ${email}`);
        return null;
      }

      return {
        registrationDate: mongoUser.registrationDate,
        lastLoginDate: mongoUser.lastLoginDate,
        totalConversations: mongoUser.totalConversations,
        userRank: mongoUser.userRank,
        name: mongoUser.name
      };
    } catch (error) {
      logger.error('Error getting MongoDB user info:', error);
      throw error;
    }
  }

  // ユーザー情報の同期
  static async syncUserInfo(email: string): Promise<SyncResult> {
    try {
      const mongoUser = await mongoose.model('User').findOne({ email });
      if (!mongoUser) {
        return {
          success: false,
          message: 'MongoDB user not found'
        };
      }

      // 既存のユーザーを検索
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        // 既存ユーザーの場合はupdate
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            rank: mongoUser.userRank,
            mongoId: mongoUser._id.toString(),
            status: mongoUser.userRank === '退会者' ? 'INACTIVE' : 'ACTIVE'
          }
        });

        return {
          success: true,
          data: updatedUser
        };
      } else {
        // 新規ユーザーの場合はcreate
        const newUser = await prisma.user.create({
          data: {
            email: email,
            name: mongoUser.name || email,
            password: '', // 必要に応じて適切なパスワードハッシュを設定
            rank: mongoUser.userRank,
            mongoId: mongoUser._id.toString(),
            status: mongoUser.userRank === '退会者' ? 'INACTIVE' : 'ACTIVE',
            gems: 0,
            level: 1,
            experience: 0
          }
        });

        logger.info(`New user created in PostgreSQL: ${email}`);
        return {
          success: true,
          data: newUser
        };
      }
    } catch (error) {
      logger.error('User sync error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // トークン消費情報の同期
  static async syncTokenInfo(email: string): Promise<SyncResult> {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email },
        select: { 
          mongoId: true,
          experience: true
        }
      });

      if (!user?.mongoId) {
        return {
          success: false,
          message: 'User not found or MongoDB ID not linked'
        };
      }

      const tokenUsage = await mongoose.model('TokenUsage').findOne({
        userId: new mongoose.Types.ObjectId(user.mongoId)
      });

      if (tokenUsage) {
        // 10000:1の変換率で経験値を計算
        const experience = Math.floor(tokenUsage.lastConsumedTokens / 10000);
        
        await prisma.user.update({
          where: { email },
          data: {
            experience: {
              increment: experience
            }
          }
        });

        return {
          success: true,
          data: { experienceGained: experience }
        };
      }

      return {
        success: true,
        message: 'No token usage found'
      };
    } catch (error) {
      logger.error('Token sync error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // MongoDB接続の確認
  static async checkMongoConnection(): Promise<boolean> {
    try {
      const isConnected = mongoose.connection.readyState === 1;
      return isConnected;
    } catch (error) {
      logger.error('MongoDB connection check error:', error);
      return false;
    }
  }
}
