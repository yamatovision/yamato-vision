import { MongoClient, ChangeStream } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import { studentIdService } from './studentIdService';

interface UserChangeEventData {
  _id: any;  // ObjectId を any に変更
  email: string;
  password?: string;
  name?: string;
  userRank: string;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  postgresSync?: {
    status: string;
    lastSyncAttempt: Date;
    postgresId: string | null;
  };
}

interface UserMongoChangeEvent {
  operationType: 'insert' | 'update';
  fullDocument: UserChangeEventData;
  documentKey: {
    _id: any;  // ObjectId を any に変更
  };
  clusterTime?: any;
}

interface UserSyncResult {
  success: boolean;
  mongoId: string;
  postgresId?: string;
  error?: string;
}


export class UserSyncService {
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly PROCESSING_TIMEOUT = 30000; // 30秒

  private mongoClient: MongoClient;
  private prisma: PrismaClient;
  private changeStream: ChangeStream | null = null;
  private isConnected: boolean = false;
  private processingUpdates: Set<string> = new Set();

  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URI!);
    this.prisma = new PrismaClient();
  }

  async getConnectionStatus() {
    let mongodbConnected = false;
    try {
      await this.mongoClient.db().admin().ping();
      mongodbConnected = true;
    } catch (error) {
      mongodbConnected = false;
    }

    return {
      isConnected: this.isConnected,
      lastSync: new Date().toISOString(),
      mongodb: mongodbConnected
    };
  }

  async initialize() {
    try {
      await this.mongoClient.connect();
      const collection = this.mongoClient.db().collection('users');
      
      this.changeStream = collection.watch(
        [{ $match: { operationType: { $in: ['insert', 'update'] } } }],
        { fullDocument: 'updateLookup' }
      );

      this.changeStream.on('change', async (change: UserMongoChangeEvent) => {
        const documentId = change.documentKey._id.toString();
        
        if (this.processingUpdates.has(documentId)) {
          console.log(`Skip processing for document ${documentId} - already in progress`);
          return;
        }

        await this.processChangeWithRetry(change);
      });

      this.changeStream.on('error', async (error: Error) => {
        console.error('ChangeStream error:', error);
        this.isConnected = false;
        await this.reconnect();
      });

      this.isConnected = true;
      console.log('User ChangeStream initialized successfully');

      setInterval(() => this.healthCheck(), 60000);
      
    } catch (error) {
      console.error('Failed to initialize User ChangeStream:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async processChangeWithRetry(change: UserMongoChangeEvent) {
    const documentId = change.documentKey._id.toString();
    this.processingUpdates.add(documentId);

    const processingTimeout = setTimeout(() => {
      if (this.processingUpdates.has(documentId)) {
        console.error(`Processing timeout for document ${documentId}`);
        this.processingUpdates.delete(documentId);
      }
    }, UserSyncService.PROCESSING_TIMEOUT);

    try {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= UserSyncService.MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`Processing attempt ${attempt} for user document ${documentId}`);
          
          const result = await this.handleUserUpdate(change);
          if (result.success) {
            console.log(`Successfully processed user document ${documentId} on attempt ${attempt}`);
            break;
          } else {
            lastError = new Error(result.error);
            if (attempt < UserSyncService.MAX_RETRY_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        } catch (error) {
          lastError = error as Error;
          if (attempt < UserSyncService.MAX_RETRY_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

    } catch (error) {
      console.error(`Failed to process user document ${documentId} after ${UserSyncService.MAX_RETRY_ATTEMPTS} attempts:`, error);
    } finally {
      clearTimeout(processingTimeout);
      this.processingUpdates.delete(documentId);
    }
  }













  private async handleUserUpdate(change: UserMongoChangeEvent): Promise<UserSyncResult> {
    const startTime = Date.now();
    try {
      const userData = change.fullDocument;
      if (!userData) {
        throw new Error('No user document data available');
      }
  
      // パスワード処理の準備
      const passwordData = userData.password ? {
        password: userData.password
      } : {};
  
      const existingUser = await this.prisma.user.findFirst({
        where: { email: userData.email }
      });




  
      // 新規ユーザー作成の場合
      if (change.operationType === 'insert' && !existingUser) {
        try {
          // 登録日時を確実に取得
          const registrationDate = new Date(userData.registrationDate || userData.createdAt || Date.now());
          console.log('Registration date for new user:', {
            email: userData.email,
            registrationDate,
            originalDate: userData.registrationDate,
            createdAt: userData.createdAt
          });
  
          const enrollmentYear = studentIdService.determineEnrollmentYear(registrationDate);
          console.log('Generating student ID:', {
            email: userData.email,
            enrollmentYear,
            timestamp: new Date().toISOString()
          });
  
          const studentId = await studentIdService.generateStudentId(enrollmentYear);
          console.log('Generated student ID:', {
            email: userData.email,
            studentId,
            enrollmentYear
          });
  
          // トランザクションで新規ユーザーとトークン追跡を作成
          const newUser = await this.prisma.$transaction(async (tx) => {
            // ユーザーの作成
            const user = await tx.user.create({
              data: {
                mongoId: userData._id.toString(),
                email: userData.email,
                name: userData.name || '',
                rank: userData.userRank,
                password: userData.password || 'aikakumei', // パスワードは必須なので、デフォルト値を設定
                studentId,
                enrollmentYear,
                level: 1,
                experience: 0,
                gems: 0,
                status: 'ACTIVE',
                isRankingVisible: true,
                isProfileVisible: true,
              }
            });
            // TokenTrackingの作成
            await tx.tokenTracking.create({
              data: {
                userId: user.id,
                weeklyTokens: 0,
                weeklyLimit: 0,
                purchasedTokens: 0,
                unprocessedTokens: 0,
                lastSyncedAt: new Date()
              }
            });
  
            return user;
          });
  
          // 初期コースの登録（別トランザクション）
          await this.prisma.userCourse.create({
            data: {
              userId: newUser.id,
              courseId: "cm53ltnv80002p8sioikiueqh",
              status: "available",
              isCurrent: true,
              startedAt: new Date(),
              certificationEligibility: true
            }
          });
  
          console.log('New user created with initial course:', {
            mongoId: userData._id,
            postgresId: newUser.id,
            rank: newUser.rank,
            studentId: newUser.studentId,
            enrollmentYear,
            duration: Date.now() - startTime
          });
  
          return { 
            success: true, 
            mongoId: userData._id.toString(),
            postgresId: newUser.id 
          };
        } catch (error) {
          console.error('Failed to create new user:', {
            error: error.message,
            stack: error.stack,
            email: userData.email,
            timestamp: new Date().toISOString()
          });
          throw error;
        }
      } else if (existingUser) {
        // 既存ユーザーの更新
        try {
          const currentRank = existingUser.rank;
          const newRank = userData.userRank;
          const isRankChanged = currentRank !== newRank;
  
          const updatedUser = await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              mongoId: userData._id.toString(),  // ここを追加
              email: userData.email,
              name: userData.name || existingUser.name,
              rank: userData.userRank,
              ...passwordData,
              updatedAt: new Date()
            }
          });
  
          if (isRankChanged) {
            console.log('User rank changed:', {
              userId: existingUser.id,
              mongoId: userData._id,
              oldRank: currentRank,
              newRank: newRank,
              timestamp: new Date()
            });
          }
  
          return { 
            success: true, 
            mongoId: userData._id.toString(),
            postgresId: updatedUser.id 
          };
        } catch (error) {
          console.error('Failed to update user:', error);
          throw error;
        }
      }
  
      throw new Error(`Unexpected state for user ${userData._id}`);
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('User sync failed:', {
        error: errorMessage,
        duration: Date.now() - startTime,
        documentId: change.documentKey._id,
        operationType: change.operationType
      });
      
      return {
        success: false,
        mongoId: change.documentKey._id.toString(),
        error: errorMessage
      };
    }
  }



















  private async healthCheck() {
    try {
      await this.mongoClient.db().admin().ping();
    } catch (error) {
      console.error('Health check failed:', error);
      await this.reconnect();
    }
  }

  private async reconnect() {
    try {
      console.log('Attempting to reconnect user sync service...');
      await this.cleanup();
      await this.initialize();
    } catch (error) {
      console.error('User sync service reconnection failed:', error);
    }
  }

  async cleanup() {
    if (this.changeStream) {
      await this.changeStream.close();
    }
    await this.mongoClient.close();
    await this.prisma.$disconnect();
    this.isConnected = false;
    this.processingUpdates.clear();
    console.log('User sync service cleaned up successfully');
  }
}