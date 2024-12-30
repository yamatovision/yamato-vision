// src/scripts/verifyMongoConnection.ts
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function verifyMongoConnection() {
  const mongoClient = new MongoClient(process.env.MONGODB_URI!);

  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    const db = mongoClient.db('motherprompt');
    const collection = db.collection('tokenusages');

    // 1. コレクションの存在確認
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // 2. 特定のドキュメントの直接検索
    const doc = await collection.findOne({ 
      userId: new ObjectId('671620c1f80526f399eed6f2')  // 命管理者のID
    });

    console.log('\nDirect document query result:');
    console.log(JSON.stringify(doc, null, 2));

    // 3. インデックス情報の確認
    const indexes = await collection.indexes();
    console.log('\nCollection indexes:');
    console.log(JSON.stringify(indexes, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoClient.close();
    console.log('\nConnection closed');
  }
}

verifyMongoConnection().catch(console.error);