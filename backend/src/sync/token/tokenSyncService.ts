import { MongoClient, ChangeStream } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import { LevelMessageService } from '../../levelMessages/levelMessageService';

import {
  MongoChangeEvent,
  SyncResult,
  TokenUpdate,
  ChangeEventData
} from './tokenTypes';

export class TokenSyncService {
  private static readonly EXP_PER_LEVEL = 1000;
  private static readonly TOKENS_PER_EXP = 10000;
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly PROCESSING_TIMEOUT = 30000; // 30秒

  private mongoClient: MongoClient;
  private prisma: PrismaClient;
  private levelMessageService: LevelMessageService;
  private changeStream: ChangeStream | null = null;
  private isConnected: boolean = false;
  private processingUpdates: Set<string> = new Set(); // 処理中の更新を追跡

  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URI!);
    this.prisma = new PrismaClient();
    this.levelMessageService = new LevelMessageService();
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
      const collection = this.mongoClient.db('motherprompt').collection('tokenusages');
      
      this.changeStream = collection.watch(
        [{ $match: { operationType: { $in: ['insert', 'update'] } } }],
        { fullDocument: 'updateLookup' }
      );

      this.changeStream.on('change', async (change: MongoChangeEvent) => {
        const documentId = change.documentKey._id.toString();
        
        // 既に処理中の更新をスキップ
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
      console.log('ChangeStream initialized successfully');

      // 定期的なヘルスチェック
      setInterval(() => this.healthCheck(), 60000);
      
    } catch (error) {
      console.error('Failed to initialize ChangeStream:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async processChangeWithRetry(change: MongoChangeEvent) {
    const documentId = change.documentKey._id.toString();
    this.processingUpdates.add(documentId);

    const processingTimeout = setTimeout(() => {
      if (this.processingUpdates.has(documentId)) {
        console.error(`Processing timeout for document ${documentId}`);
        this.processingUpdates.delete(documentId);
      }
    }, TokenSyncService.PROCESSING_TIMEOUT);

    try {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= TokenSyncService.MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`Processing attempt ${attempt} for document ${documentId}`);
          
          const result = await this.handleTokenUpdate(change);
          if (result.success) {
            console.log(`Successfully processed document ${documentId} on attempt ${attempt}`);
            break;
          } else {
            lastError = new Error(result.error);
            if (attempt < TokenSyncService.MAX_RETRY_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        } catch (error) {
          lastError = error as Error;
          if (attempt < TokenSyncService.MAX_RETRY_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (lastError) {
        throw lastError;
      }

    } catch (error) {
      console.error(`Failed to process document ${documentId} after ${TokenSyncService.MAX_RETRY_ATTEMPTS} attempts:`, error);
    } finally {
      clearTimeout(processingTimeout);
      this.processingUpdates.delete(documentId);
    }
  }

  private async handleTokenUpdate(change: MongoChangeEvent): Promise<SyncResult> {
    const startTime = Date.now();
    try {
      const tokenData = change.fullDocument;
      if (!tokenData) {
        throw new Error('No document data available');
      }
  
      // MongoDBのuserIdは文字列として扱う
      const user = await this.prisma.user.findFirst({
        where: { mongoId: tokenData.userId.toString() }
      });
  
      if (!user) {
        throw new Error(`User not found for mongoId: ${tokenData.userId}`);
      }

      await this.prisma.$transaction(async (prisma) => {
        // トークンデータの更新
        const tokenUpdate = await this.updateTokenTracking(user.id, tokenData);
        
        // 経験値の計算と更新
        const result = await this.processExperienceUpdate(user.id, tokenUpdate.unprocessedTokens);

        console.log('Token update completed:', {
          userId: user.id,
          duration: Date.now() - startTime,
          newWeeklyTokens: tokenUpdate.weeklyTokens,
          experienceGained: result.experienceGained
        });
      });

      return { success: true, userId: user.id };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Token update failed:', {
        error: errorMessage,
        duration: Date.now() - startTime,
        documentId: change.documentKey._id
      });
      
      return {
        success: false,
        userId: change.fullDocument?.userId || 'unknown',
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
      console.log('Attempting to reconnect...');
      await this.cleanup();
      await this.initialize();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }







  private async updateTokenTracking(
    userId: string,
    tokenData: ChangeEventData
  ): Promise<TokenUpdate> {
    const currentTracking = await this.prisma.tokenTracking.findUnique({
      where: { userId }
    });
  
    const weeklyTokens = tokenData.weeklyUsage?.count || 0;
    const weeklyLimit = tokenData.weeklyUsage?.baseLimit || 0;
    const purchasedTokens = tokenData.purchasedTokens?.amount || 0;
  
    const tokenDifference = currentTracking
      ? weeklyTokens - currentTracking.weeklyTokens
      : weeklyTokens;
  
    return await this.prisma.tokenTracking.upsert({
      where: { userId },
      create: {
        userId,
        weeklyTokens,
        weeklyLimit,
        purchasedTokens,
        unprocessedTokens: weeklyTokens,
        lastSyncedAt: new Date()
      },
      update: {
        weeklyTokens,
        weeklyLimit,
        purchasedTokens,
        unprocessedTokens: {
          increment: Math.max(0, tokenDifference)
        },
        lastSyncedAt: new Date()
      }
    });
  }

  public async processExperienceUpdate(
    userId: string,
    unprocessedTokens: number
  ) {
    console.log('Processing experience update:', {
      userId,
      unprocessedTokens,
      timestamp: new Date().toISOString()
    });
  
    if (unprocessedTokens <= 0) {
      console.log('No unprocessed tokens to handle');
      return { experienceGained: 0 };
    }
  
    const expToAdd = Math.floor(unprocessedTokens / TokenSyncService.TOKENS_PER_EXP);
    const remainingTokens = unprocessedTokens % TokenSyncService.TOKENS_PER_EXP;
  
    console.log('Calculated experience:', {
      expToAdd,
      remainingTokens,
      tokensPerExp: TokenSyncService.TOKENS_PER_EXP
    });
  
    if (expToAdd === 0) {
      console.log('No experience to add');
      return { experienceGained: 0 };
    }
  
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    const oldLevel = user.level;
    const newExp = user.experience + expToAdd;
    const newLevel = Math.floor(newExp / TokenSyncService.EXP_PER_LEVEL) + 1;
  
    console.log('Experience update details:', {
      oldExp: user.experience,
      newExp,
      oldLevel,
      newLevel,
      expToAdd
    });
  
    let levelUpMessage = null;
    if (newLevel > oldLevel) {
      const message = await this.levelMessageService.getMessageForLevel(newLevel);
      levelUpMessage = message?.message || null;
    }
  
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          experience: newExp,
          level: newLevel
        }
      }),
      this.prisma.tokenTracking.update({
        where: { userId },
        data: {
          unprocessedTokens: remainingTokens
        }
      })
    ]);
  
    const result = {
      experienceGained: expToAdd,
      levelUp: newLevel > oldLevel ? {
        oldLevel,
        newLevel,
        message: levelUpMessage
      } : undefined
    };
  
    console.log('Experience update result:', result);
    return result;
  }

  public async cleanup() {
    if (this.changeStream) {
      await this.changeStream.close();
    }
    await this.mongoClient.close();
    await this.prisma.$disconnect();
    this.isConnected = false;
    this.processingUpdates.clear();
    console.log('Sync service cleaned up successfully');
  }
}