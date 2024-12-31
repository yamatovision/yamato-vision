// backend/src/scripts/testExperienceNotification.ts

import { PrismaClient } from '@prisma/client';
import { ProfileService } from '../users/profile/profileService';
import { TokenSyncService } from '../sync/token/tokenSyncService';

const prisma = new PrismaClient();

async function testExperienceNotification(userId: string) {
  try {
    console.log('=== Experience Notification Test ===');
    
    // 初期状態を取得
    const initialUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        experience: true,
        level: true,
        tokenTracking: {
          select: {
            unprocessedTokens: true
          }
        }
      }
    });

    console.log('Initial state:', {
      experience: initialUser?.experience,
      level: initialUser?.level,
      unprocessedTokens: initialUser?.tokenTracking?.unprocessedTokens
    });

    // ProfileServiceのテスト
    const profileService = new ProfileService();
    const profileResult = await profileService.getProfile(userId);

    console.log('Profile response:', {
      experience: profileResult.experience,
      level: profileResult.level,
      expGained: profileResult.expGained,
      levelUpData: profileResult.levelUpData
    });

    // 結果の差分を表示
    console.log('Differences:', {
      expDiff: profileResult.experience - (initialUser?.experience || 0),
      levelDiff: profileResult.level - (initialUser?.level || 0)
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// テスト実行
// コマンドライン引数からユーザーIDを取得
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID as an argument');
  process.exit(1);
}

testExperienceNotification(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });