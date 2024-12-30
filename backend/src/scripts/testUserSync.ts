import { MongoClient, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const mongoClient = new MongoClient(process.env.MONGODB_URI!);

const TEST_EMAIL = "test_sync@example.com";

async function cleanupTestUser() {
  console.log('テストユーザーのクリーンアップ開始...');
  
  // MongoDBからの削除
  await mongoClient.db().collection('users').deleteOne({ 
    email: TEST_EMAIL 
  });
  
  // Prismaからの削除
  const existingUser = await prisma.user.findFirst({
    where: { email: TEST_EMAIL },
    include: { tokenTracking: true }
  });

  if (existingUser) {
    // TokenTrackingを先に削除
    if (existingUser.tokenTracking) {
      await prisma.tokenTracking.delete({
        where: { userId: existingUser.id }
      });
    }
    
    // ユーザーを削除
    await prisma.user.delete({
      where: { id: existingUser.id }
    });
  }
  
  console.log('クリーンアップ完了');
}

async function runTests() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();

    // クリーンアップを実行
    await cleanupTestUser();

    // 1. 新規ユーザー作成テスト
    console.log('\nテスト1: 新規ユーザー作成');
    const password = await bcrypt.hash('testpass123', 10);
    const insertResult = await db.collection('users').insertOne({
      email: TEST_EMAIL,
      name: "Test Sync User",
      userRank: "お試し",
      password
    });
    console.log('MongoDB挿入結果:', insertResult);

    // 同期を待つ
    console.log('同期待機中...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // MongoDB確認
    const mongoUser = await db.collection('users').findOne({ email: TEST_EMAIL });
    console.log('MongoDBのユーザー:', mongoUser);

    let syncedUser = await prisma.user.findFirst({
      where: { email: TEST_EMAIL },
      include: { tokenTracking: true }
    });
    console.log('Prismaの同期されたユーザー:', syncedUser);

    if (!syncedUser) {
      console.log('同期失敗: ユーザーが見つかりません');
      return;
    }

    // 2. パスワード変更テスト
    console.log('\nテスト2: パスワード変更');
    const newPassword = await bcrypt.hash('newpass123', 10);
    const passwordUpdateResult = await db.collection('users').updateOne(
      { email: TEST_EMAIL },
      { $set: { password: newPassword } }
    );
    console.log('パスワード更新MongoDB結果:', passwordUpdateResult);

    // 同期を待つ
    console.log('パスワード更新同期待機中...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    syncedUser = await prisma.user.findFirst({
      where: { email: TEST_EMAIL },
      include: { tokenTracking: true }
    });
    console.log('パスワード更新後のユーザー:', {
      userId: syncedUser?.id,
      passwordMatches: syncedUser?.password === newPassword
    });

    // 3. ランク変更テスト
    console.log('\nテスト3: ランク変更');
    const rankUpdateResult = await db.collection('users').updateOne(
      { email: TEST_EMAIL },
      { $set: { userRank: "中伝" } }
    );
    console.log('ランク更新MongoDB結果:', rankUpdateResult);

    // 同期を待つ
    console.log('ランク更新同期待機中...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    syncedUser = await prisma.user.findFirst({
      where: { email: TEST_EMAIL },
      include: { tokenTracking: true }
    });
    console.log('ランク更新後の完全なユーザー情報:', syncedUser);

  } catch (error) {
    console.error('テスト実行中にエラーが発生:', error);
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

// テストの実行
runTests().catch(console.error);