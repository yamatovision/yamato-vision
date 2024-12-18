'use client';

import { useTheme } from '@/context/ThemeContext';

export function HomeProfile() {
  const { theme } = useTheme();
  
  // グラデーションの条件付きスタイル
  const gradientStyle = theme === 'dark'
    ? 'from-blue-900 to-purple-900'
    : 'from-sky-100 to-blue-100';
    
  return (
    <div className={`bg-gradient-to-r ${gradientStyle} rounded-2xl p-6 mb-8`}>
      <div className="flex justify-between">
        {/* プロフィール基本情報 */}
        <div className="flex space-x-6">
          {/* アバターと階級 */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-yellow-400">
              <img src="https://placehold.jp/150x150.png" alt="アバター" className="w-full h-full object-cover" />
            </div>
            {/* 階級表示の改善 */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
              <span className="text-xs">階級</span>
              <span>極伝</span>
            </div>
          </div>

          {/* ユーザー情報 */}
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>山田太郎</h1>
            
            {/* レベルと経験値ゲージ */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Lv.25</span>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>次のレベルまで: 2,450 EXP</span>
              </div>
              <div className={`w-48 h-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              } rounded-full`}>
                <div className="h-full bg-blue-500 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>

            {/* ジェムとSNSリンク */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">💎</span>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                }`}>1,234</span>
              </div>
              <div className="flex items-center space-x-3">
                <a href="#" className={`text-sm ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                } hover:underline`}>LINE</a>
                <a href="#" className={`text-sm ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                } hover:underline`}>Twitter</a>
                <a href="#" className={`text-sm ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                } hover:underline`}>TikTok</a>
              </div>
            </div>
          </div>
        </div>

        {/* バッジコレクション */}
        <div className="grid grid-cols-4 gap-2">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            🏆
          </div>
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
            ⭐️
          </div>
          <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
            🎯
          </div>
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
            🔒
          </div>
        </div>
      </div>
    </div>
  );
}
