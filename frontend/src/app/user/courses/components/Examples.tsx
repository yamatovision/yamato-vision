'use client';

import { useTheme } from '@/contexts/theme';  // パスを修正

export function Examples() {
  const { theme } = useTheme();

  const submissions = [
    {
      id: 1,
      user: {
        name: 'Tanaka S.',
        avatar: 'https://placehold.jp/30x30.png',
        submittedAt: '2時間前'
      },
      prompt: '商品の特徴を分析し、ブランドトーンを維持しながら魅力的な説明文を生成してください...',
      likes: 24,
      comments: 8,
      badge: '⭐️ 優秀回答'
    },
    {
      id: 2,
      user: {
        name: 'Yamada K.',
        avatar: 'https://placehold.jp/30x30.png',
        submittedAt: '3時間前'
      },
      prompt: 'ブランドの個性を活かしつつ、商品の価値を効果的に伝える説明文を...',
      likes: 18,
      comments: 5,
      badge: '🎯 ユニーク回答'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className={`font-bold text-lg ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>
        みんなの提出課題
      </h2>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div 
            key={submission.id}
            className={`${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            } rounded-lg p-4`}
          >
            {/* ヘッダー部分 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={submission.user.avatar} 
                  alt={submission.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className={`font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                  }`}>
                    {submission.user.name}
                  </div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {submission.user.submittedAt}に提出
                  </div>
                </div>
              </div>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {submission.badge}
              </span>
            </div>

            {/* プロンプト内容 */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded p-3 mb-3 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              } mb-1`}>プロンプト:</p>
              <p>{submission.prompt}</p>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <button className={`flex items-center space-x-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } hover:text-blue-500 transition-colors`}>
                  <span>👍</span>
                  <span>{submission.likes}</span>
                </button>
                <button className={`flex items-center space-x-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } hover:text-blue-500 transition-colors`}>
                  <span>💭</span>
                  <span>{submission.comments}</span>
                </button>
              </div>
              <button className={`${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              } hover:underline`}>
                詳細を見る
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* フィルターオプション */}
      <div className="flex justify-center space-x-2">
        <button className={`px-3 py-1 rounded-full text-sm ${
          theme === 'dark' 
            ? 'bg-blue-900/30 text-blue-400' 
            : 'bg-blue-100 text-blue-600'
        }`}>
          最新順
        </button>
        <button className={`px-3 py-1 rounded-full text-sm ${
          theme === 'dark' 
            ? 'bg-blue-900/30 text-blue-400' 
            : 'bg-blue-100 text-blue-600'
        }`}>
          いいね順
        </button>
        <button className={`px-3 py-1 rounded-full text-sm ${
          theme === 'dark' 
            ? 'bg-blue-900/30 text-blue-400' 
            : 'bg-blue-100 text-blue-600'
        }`}>
          優秀回答のみ
        </button>
      </div>
    </div>
  );
}
