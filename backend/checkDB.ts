// checkDB.ts
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://lisence:FhpQAu5UPwjm0L1J@motherprompt-cluster.np3xp.mongodb.net/motherprompt?retryWrites=true&w=majority&appName=MotherPrompt-Cluster';
const prisma = new PrismaClient();

// MongoDBのユーザースキーマを一度だけ定義
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    userRank: String
});

// モデルを一度だけ定義
let User: any;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', userSchema);
}

const checkBothDatabases = async (email: string): Promise<any> => {
    try {
        // MongoDB接続
        await mongoose.connect(MONGODB_URI);

        // MongoDB のユーザー取得
        const mongoUser = await User.findOne({ email });
        console.log('\nMongoDB User Data:', {
            id: mongoUser?._id,
            email: mongoUser?.email,
            hasPassword: !!mongoUser?.password,
            passwordHash: mongoUser?.password,
            rank: mongoUser?.userRank
        });

        // PostgreSQL のユーザー取得
        const pgUser = await prisma.user.findUnique({
            where: { email }
        });
        console.log('\nPostgreSQL User Data:', {
            id: pgUser?.id,
            email: pgUser?.email,
            hasPassword: !!pgUser?.password,
            passwordHash: pgUser?.password,
            mongoId: pgUser?.mongoId,
            status: pgUser?.status
        });

        // パスワードの比較
        console.log('\nPassword Comparison:', {
            passwordsMatch: mongoUser?.password === pgUser?.password
        });

        return { mongoUser, pgUser };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

const syncPassword = async (email: string, newPassword: string): Promise<void> => {
    try {
        console.log('Starting password synchronization...');
        
        // 新しいパスワードのハッシュ化（saltRounds を 8 に統一）
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        console.log('Generated new password hash');

        // MongoDB更新
        await mongoose.connect(MONGODB_URI);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );
        console.log('MongoDB password updated');

        // PostgreSQL更新
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log('PostgreSQL password updated');

        console.log('Password synchronized successfully');

        // 確認のため再度チェック
        console.log('\nVerifying synchronization:');
        await checkBothDatabases(email);

    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        await mongoose.disconnect();
        await prisma.$disconnect();
    }
};

// メイン処理
const main = async (): Promise<void> => {
    try {
        // まず現在の状態をチェック
        console.log('Current database state:');
        await checkBothDatabases('lisence@mikoto.co.jp');

        // パスワードの同期を実行
        console.log('\nExecuting password synchronization:');
        await syncPassword('lisence@mikoto.co.jp', 'NewPassword123!');
    } catch (error) {
        console.error('Main execution error:', error);
    } finally {
        await mongoose.disconnect();
        await prisma.$disconnect();
    }
};

// 実行
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });