import { MongoClient, ChangeStream } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import { studentIdService } from './studentIdService';

interface UserChangeEventData {
  _id: any;
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
    _id: any;
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
    console.log('UserSyncServiceのインスタンスを作成中...');
    this.mongoClient = new MongoClient(process.env.MONGODB_URI!);
    this.prisma = new PrismaClient();
  }

  // 接続状態を取得するメソッド
  async getConnectionStatus() {
    console.log('接続状態を確認中...');
    let mongodbConnected = false;
    try {
      await this.mongoClient.db().admin().ping();
      mongodbConnected = true;
      console.log('MongoDB接続確認: 成功');
    } catch (error) {
      console.error('MongoDB接続確認: 失敗', error);
      mongodbConnected = false;
    }

    return {
      isConnected: this.isConnected,
      lastSync: new Date().toISOString(),
      mongodb: mongodbConnected
    };
  }

  // 初期化処理
  async initialize() {
    console.log('UserSyncServiceの初期化を開始...');
    try {
      await this.mongoClient.connect();
      console.log('MongoDBに正常に接続しました');
      
      const collection = this.mongoClient.db().collection('users');
      console.log('ユーザーコレクションへの接続確立');
      
      // ChangeStreamの設定
      this.changeStream = collection.watch(
        [{ $match: { operationType: { $in: ['insert', 'update'] } } }],
        { fullDocument: 'updateLookup' }
      );
      console.log('ChangeStreamを正常に作成しました');

      // 変更検知のイベントリスナー
      this.changeStream.on('change', async (change: UserMongoChangeEvent) => {
        const documentId = change.documentKey._id.toString();
        console.log('変更を検知:', {
          操作タイプ: change.operationType,
          ドキュメントID: documentId,
          メールアドレス: change.fullDocument?.email,
          タイムスタンプ: new Date().toISOString()
        });
        
        if (this.processingUpdates.has(documentId)) {
          console.log(`ドキュメント ${documentId} は既に処理中のため、スキップします`);
          return;
        }

        await this.processChangeWithRetry(change);
      });

      // エラー検知のイベントリスナー
      this.changeStream.on('error', async (error: Error) => {
        console.error('ChangeStreamエラー発生:', error);
        this.isConnected = false;
        await this.reconnect();
      });

      this.isConnected = true;
      console.log('UserSyncServiceの初期化が完了しました');

      // ヘルスチェックの開始
      setInterval(() => this.healthCheck(), 60000);
      
    } catch (error) {
      console.error('UserSyncServiceの初期化に失敗:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // 変更処理の再試行
  private async processChangeWithRetry(change: UserMongoChangeEvent) {
    const documentId = change.documentKey._id.toString();
    this.processingUpdates.add(documentId);
    console.log(`ドキュメント ${documentId} の処理を開始`);

    const processingTimeout = setTimeout(() => {
      if (this.processingUpdates.has(documentId)) {
        console.error(`ドキュメント ${documentId} の処理がタイムアウトしました`);
        this.processingUpdates.delete(documentId);
      }
    }, UserSyncService.PROCESSING_TIMEOUT);

    try {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= UserSyncService.MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`ドキュメント ${documentId} の処理を試行中 (${attempt}回目)`);
          
          const result = await this.handleUserUpdate(change);
          if (result.success) {
            console.log(`ドキュメント ${documentId} の処理が成功しました (${attempt}回目)`);
            break;
          } else {
            lastError = new Error(result.error);
            console.error(`処理に失敗、再試行準備中:`, result.error);
            if (attempt < UserSyncService.MAX_RETRY_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        } catch (error) {
          lastError = error as Error;
          console.error(`処理中にエラー発生 (${attempt}回目):`, error);
          if (attempt < UserSyncService.MAX_RETRY_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

    } catch (error) {
      console.error(`ドキュメント ${documentId} の処理が ${UserSyncService.MAX_RETRY_ATTEMPTS} 回の試行後も失敗:`, error);
    } finally {
      clearTimeout(processingTimeout);
      this.processingUpdates.delete(documentId);
      console.log(`ドキュメント ${documentId} の処理を完了`);
    }
  }


  

  // ユーザー更新の処理
  private async handleUserUpdate(change: UserMongoChangeEvent): Promise<UserSyncResult> {
    const startTime = Date.now();
    console.log('ユーザー更新処理を開始:', {
      操作タイプ: change.operationType,
      MongoID: change.documentKey._id.toString(),
      メールアドレス: change.fullDocument?.email
    });

    try {
      const userData = change.fullDocument;
      if (!userData) {
        throw new Error('ユーザードキュメントのデータが存在しません');
      }
  
      const passwordData = userData.password ? {
        password: userData.password
      } : {};
  
      const existingUser = await this.prisma.user.findFirst({
        where: { email: userData.email }
      });

      // 新規ユーザー作成の処理
      if (change.operationType === 'insert' && !existingUser) {
        try {
          const registrationDate = new Date(userData.registrationDate || userData.createdAt || Date.now());
          console.log('新規ユーザーの登録日:', {
            メールアドレス: userData.email,
            登録日: registrationDate,
            元の日付: userData.registrationDate,
            作成日: userData.createdAt
          });
  
          const enrollmentYear = studentIdService.determineEnrollmentYear(registrationDate);
          console.log('学生ID生成準備:', {
            メールアドレス: userData.email,
            入学年度: enrollmentYear,
            タイムスタンプ: new Date().toISOString()
          });
  
          const studentId = await studentIdService.generateStudentId(enrollmentYear);
          console.log('学生ID生成完了:', {
            メールアドレス: userData.email,
            学生ID: studentId,
            入学年度: enrollmentYear
          });
  
          // トランザクションでの新規ユーザー作成
          const newUser = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                mongoId: userData._id.toString(),
                email: userData.email,
                name: userData.name || '',
                rank: userData.userRank,
                password: userData.password || 'aikakumei',
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
  
          // 初期コースの登録
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
  
          console.log('新規ユーザーとコースの作成完了:', {
            MongoID: userData._id,
            PostgresID: newUser.id,
            ランク: newUser.rank,
            学生ID: newUser.studentId,
            入学年度: enrollmentYear,
            処理時間: Date.now() - startTime
          });
  
          return { 
            success: true, 
            mongoId: userData._id.toString(),
            postgresId: newUser.id 
          };
        } catch (error) {
          console.error('新規ユーザー作成失敗:', {
            エラー: error.message,
            スタック: error.stack,
            メールアドレス: userData.email,
            タイムスタンプ: new Date().toISOString()
          });
          throw error;
        }
      } else if (existingUser) {
        // 既存ユーザーの更新処理
        try {
          const currentRank = existingUser.rank;
          const newRank = userData.userRank;
          const isRankChanged = currentRank !== newRank;
  
          const updatedUser = await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              mongoId: userData._id.toString(),
              email: userData.email,
              name: userData.name || existingUser.name,
              rank: userData.userRank,
              ...passwordData,
              updatedAt: new Date()
            }
          });
  
          if (isRankChanged) {
            console.log('ユーザーランクが変更されました:', {
              ユーザーID: existingUser.id,
              MongoID: userData._id,
              旧ランク: currentRank,
              新ランク: newRank,
              タイムスタンプ: new Date()
            });
          }
  
          return { 
            success: true, 
            mongoId: userData._id.toString(),
            postgresId: updatedUser.id 
          };
        } catch (error) {
          console.error('ユーザー更新失敗:', error);
          throw error;
        }
      }
  
      throw new Error(`予期しないユーザー状態: ${userData._id}`);
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      console.error('ユーザー同期失敗:', {
        エラー: errorMessage,
        処理時間: Date.now() - startTime,
        ドキュメントID: change.documentKey._id,
        操作タイプ: change.operationType
      });
      
      return {
        success: false,
        mongoId: change.documentKey._id.toString(),
        error: errorMessage
      };
    }
  }

  // ヘルスチェック
  private async healthCheck() {
    try {
      await this.mongoClient.db().admin().ping();
      console.log('ヘルスチェック: OK');
    } catch (error) {
      console.error('ヘルスチェック失敗:', error);
      await this.reconnect();
    }
  }

  // 再接続処理
  private async reconnect() {
    try {
      console.log('UserSyncServiceの再接続を試みます...');
      await this.cleanup();
      await this.initialize();
    } catch (error) {
      console.error('UserSyncServiceの再接続に失敗:', error);
    }
  }

  // クリーンアップ処理
  async cleanup() {
    if (this.changeStream) {
      await this.changeStream.close();
    }
    await this.mongoClient.close();
    await this.prisma.$disconnect();
    this.isConnected = false;
    this.processingUpdates.clear();
    console.log('UserSyncServiceのクリーンアップが完了しました');
  }
}