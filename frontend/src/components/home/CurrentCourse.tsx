'use client';

import { useTheme } from '@/context/ThemeContext';

export function CurrentCourse() {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
            現在のコース
          </h2>
          <p className="text-blue-400">
            AIプロンプトエンジニアリング基礎 Stage 2-1
          </p>
        </div>
        <div className="text-right">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            残り時間
          </div>
          <div className="text-xl font-bold text-orange-400">
            02:45:30
          </div>
        </div>
      </div>

      {/* 3段階進捗表示 */}
      <div className="flex items-center justify-between space-x-4 mb-6">
        <div className={`w-1/3 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100'} rounded-lg p-3 text-center`}>
          <div className="text-green-400 text-2xl mb-1">✓</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>レッスン完了</div>
        </div>
        <div className={`w-1/3 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'} rounded-lg p-3 text-center relative animate-pulse`}>
          <div className="text-blue-400 text-2xl mb-1">➤</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>課題挑戦中</div>
        </div>
        <div className={`w-1/3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
          <div className={`text-2xl mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>��</div>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>次のステージ</div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2 mb-4`}>
        <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
      </div>

      {/* 参加者と大きめのボタン */}
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          <img src="https://placehold.jp/30x30.png" className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-gray-800' : 'border-white'}`} />
          <img src="https://placehold.jp/30x30.png" className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-gray-800' : 'border-white'}`} />
          <img src="https://placehold.jp/30x30.png" className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-gray-800' : 'border-white'}`} />
          <div className={`w-8 h-8 rounded-full border-2 ${
            theme === 'dark' ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-100'
          } flex items-center justify-center text-sm`}>
            +5
          </div>
        </div>
      </div>
      
      {/* より柔らかい色合いのボタン */}
      <button className={`w-full mt-4 ${
        theme === 'dark' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-blue-400 hover:bg-blue-500'
      } text-white py-4 rounded-lg text-lg font-bold transition-colors shadow-lg`}>
        続きから学習する
      </button>
    </div>
  );
}
