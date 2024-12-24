// backend/src/scripts/processTokens.ts

import { TokenUsageService, TokenProcessResult } from '../token/tokenUsageService';

async function main() {
  try {
    console.log('Starting token processing...');
    const tokenService = new TokenUsageService();
    const results = await tokenService.processAllUnprocessedTokens();
    
    console.log('Processing results:');
    results.forEach(result => {
      console.log(`User ${result.userId}:`);
      console.log(`- Experience gained: ${result.experienceGained}`);
      console.log(`- New level: ${result.currentLevel}`);
      if (result.levelUpMessage) {
        console.log(`- Level up message: ${result.levelUpMessage}`);
      }
      console.log('---');
    });
    
    console.log('Token processing completed successfully');
  } catch (error) {
    console.error('Error processing tokens:', error);
  } finally {
    process.exit();
  }
}

main();