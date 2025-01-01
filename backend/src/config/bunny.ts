// backend/src/config/bunny.ts
interface BunnyConfig {
  apiKey: string | undefined;
  libraryId: string | undefined;
  cdnUrl: string;
}

export const bunnyConfig: BunnyConfig = {
  apiKey: process.env.BUNNY_API_KEY,
  libraryId: process.env.BUNNY_LIBRARY_ID,
  cdnUrl: process.env.BUNNY_CDN_URL || 'https://vz-7b4f2b4c-53c.b-cdn.net'
};

// 設定値の存在確認を追加
if (!bunnyConfig.apiKey || !bunnyConfig.libraryId) {
  console.error('Missing Bunny.net configuration:', {
    apiKey: !!bunnyConfig.apiKey,
    libraryId: !!bunnyConfig.libraryId
  });
}