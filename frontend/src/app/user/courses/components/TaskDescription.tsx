'use client';

import { useTheme } from '@/contexts/theme';  // パスを修正

export function TaskDescription() {
  const { theme } = useTheme();
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>実践課題</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        } mb-4`}>
          以下のシナリオに対して、最適なプロンプトを作成してください。
          作成したプロンプトは実際に動作確認を行い、結果と共に提出してください。
        </p>
        <div className={`${
          theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
        } rounded-lg p-4 border ${
          theme === 'dark' ? 'border-gray-600' : 'border-blue-100'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-200' : 'text-[#1E40AF]'
          }`}>
            シナリオ：ECサイトの商品説明文を生成するAIシステムを構築したい。
            ブランドの特徴を維持しながら、魅力的な説明文を生成するプロンプトを作成してください。
          </p>
        </div>
      </div>

      {/* 提出フォーム */}
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            プロンプト
          </label>
          <textarea 
            className={`w-full h-32 rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            placeholder="プロンプトを入力してください"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            動作結果
          </label>
          <textarea 
            className={`w-full h-32 rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            placeholder="AIの出力結果を貼り付けてください"
          />
        </div>
        <div className="flex justify-end">
          <button className={`${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-6 py-3 rounded-lg font-bold transition-colors`}>
            課題を提出
          </button>
        </div>
      </div>
    </div>
  );
}
