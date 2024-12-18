'use client';

import { useTheme } from '@/context/ThemeContext';

export function WeeklyRanking() {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>週間ランキング</h2>
      
      {/* 1位 - ダークモードは黄色系、ライトモードは青系 */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-yellow-900 to-yellow-700' 
          : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 border border-blue-200'
      } rounded-lg p-4 mb-3 shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className={`${
            theme === 'dark'
              ? 'text-yellow-400'
              : 'bg-blue-500/10 text-blue-600'
          } w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm`}>
            1
          </div>
          <img src="https://placehold.jp/30x30.png" className="w-8 h-8 rounded-full" />
          <div>
            <div className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>鈴木一郎</div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-blue-600'
              }`}>15,000 EXP</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark'
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-blue-100 text-blue-600'
              }`}>GOLD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2位 */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      } rounded-lg p-4 mb-3`}>
        <div className="flex items-center space-x-3">
          <div className={`${
            theme === 'dark'
              ? 'bg-gray-600 text-gray-300'
              : 'bg-gray-200 text-gray-600'
          } w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm`}>
            2
          </div>
          <img src="https://placehold.jp/30x30.png" className="w-8 h-8 rounded-full" />
          <div>
            <div className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>佐藤二郎</div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>12,500 EXP</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-200 text-gray-600'
              }`}>SILVER</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3位 */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      } rounded-lg p-4`}>
        <div className="flex items-center space-x-3">
          <div className={`${
            theme === 'dark'
              ? 'bg-gray-600 text-gray-300'
              : 'bg-gray-200 text-gray-600'
          } w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm`}>
            3
          </div>
          <img src="https://placehold.jp/30x30.png" className="w-8 h-8 rounded-full" />
          <div>
            <div className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>田中三郎</div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>10,800 EXP</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-200 text-gray-600'
              }`}>BRONZE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
