// src/scripts/checkCurrentSync.ts
import { MongoClient, ObjectId } from 'mongodb';  // ObjectIdをインポート
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function checkCurrentSync() {
  const mongoClient = new MongoClient(process.env.MONGODB_URI!);
  const prisma = new PrismaClient();

  try {
    await mongoClient.connect();
    console.log('Connected to databases');

    const db = mongoClient.db('motherprompt');
    console.log('\nUsing database:', db.databaseName);
    
    const collection = db.collection('tokenusages');
    console.log('Collection:', collection.collectionName);

    // ObjectIdを使用してクエリを実行
    const tokenUsage = await collection.findOne({
      userId: new ObjectId("671620c1f80526f399eed6f2")  // ObjectIdとして検索
    });

    // クエリ条件の確認用ログ
    console.log('\nQuery Conditions:');
    console.log({
      userId: new ObjectId("671620c1f80526f399eed6f2"),
      userIdType: typeof new ObjectId("671620c1f80526f399eed6f2")
    });

    console.log('\nRaw MongoDB Query Result:');
    console.log(JSON.stringify(tokenUsage, null, 2));

    // Prisma側のデータ取得
    const user = await prisma.user.findFirst({
      where: { mongoId: '671620c1f80526f399eed6f2' },
      include: { tokenTracking: true }
    });

    console.log('\nMongoDB Data:');
    console.log('-------------');
    console.log({
      weeklyCount: tokenUsage?.weeklyUsage?.count || 0,
      baseLimit: tokenUsage?.weeklyUsage?.baseLimit || 0,
      lastReset: tokenUsage?.weeklyUsage?.lastResetDate,
      lastUpdate: tokenUsage?.updatedAt,
      totalTokensConsumed: tokenUsage?.totalTokensConsumed || 0,
      documentId: tokenUsage?._id,
      userId: tokenUsage?.userId
    });

    console.log('\nPrisma Data:');
    console.log('------------');
    console.log({
      weeklyTokens: user?.tokenTracking?.weeklyTokens || 0,
      weeklyLimit: user?.tokenTracking?.weeklyLimit || 0,
      unprocessedTokens: user?.tokenTracking?.unprocessedTokens || 0,
      lastSync: user?.tokenTracking?.lastSyncedAt,
      experience: user?.experience,
      level: user?.level,
      mongoId: user?.mongoId
    });

    const difference = (tokenUsage?.weeklyUsage?.count || 0) - 
                      (user?.tokenTracking?.weeklyTokens || 0);

    console.log('\nSync Status:');
    console.log('------------');
    console.log({
      difference,
      isSynced: difference === 0,
      lastSyncAge: user?.tokenTracking?.lastSyncedAt ? 
        `${Math.round((Date.now() - user.tokenTracking.lastSyncedAt.getTime()) / 1000)} seconds ago` : 
        'Never'
    });

  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
    console.log('\nConnections closed');
  }
}

checkCurrentSync().catch(console.error);