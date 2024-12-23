import { CronJob } from 'cron';
import { TokenProcessingService } from '../services/token/tokenProcessingService';

// 1時間ごとの同期
export const tokenSyncJob = new CronJob('0 * * * *', async () => {
  console.log('Starting periodic token sync...');
  try {
    await TokenProcessingService.performPeriodicSync();
    console.log('Periodic token sync completed');
  } catch (error) {
    console.error('Periodic token sync failed:', error);
  }
}, null, true, 'Asia/Tokyo');
