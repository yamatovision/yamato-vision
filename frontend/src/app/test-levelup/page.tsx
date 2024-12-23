'use client';

import { useToast } from '@/contexts/toast';

export default function TestLevelUp() {
  const { showToast } = useToast();

  const showLevel2Message = () => {
    showToast(
      'おめでとう！レベル2になりました！',
      'levelUp',
      {
        newLevel: 2,
        specialUnlock: '新しい修行メニューが解放されました！'
      }
    );
  };

  const showLevel3Message = () => {
    showToast(
      'レベル3達成！さらなる高みへ！',
      'levelUp',
      {
        newLevel: 3,
        specialUnlock: '掲示板機能が解放されました！'
      }
    );
  };

  const showDefaultLevelUpMessage = () => {
    showToast(
      'レベルアップしました！',
      'levelUp',
      {
        newLevel: 4
      }
    );
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">レベルアップ表示テスト</h1>
      
      <div className="space-y-4">
        <button
          onClick={showLevel2Message}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          レベル2のメッセージを表示
        </button>

        <button
          onClick={showLevel3Message}
          className="block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          レベル3のメッセージを表示
        </button>

        <button
          onClick={showDefaultLevelUpMessage}
          className="block bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          デフォルトのレベルアップメッセージを表示
        </button>
      </div>

      {/* 現在の表示例を静的に表示 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">表示例：</h2>
        
        <div className="space-y-4">
          {/* レベル2の表示例 */}
          <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white rounded-md shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">
                🎊 Level Up! 🎊
              </div>
              <div className="text-5xl font-bold mb-4">
                Lv.2
              </div>
              <div className="text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4">
                🎉 新しい修行メニューが解放されました！ 🎉
              </div>
              <div className="text-sm text-yellow-100 mt-4">
                クリックして閉じる
              </div>
            </div>
          </div>

          {/* レベル3の表示例 */}
          <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white rounded-md shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">
                🎊 Level Up! 🎊
              </div>
              <div className="text-5xl font-bold mb-4">
                Lv.3
              </div>
              <div className="text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4">
                🎉 掲示板機能が解放されました！ 🎉
              </div>
              <div className="text-sm text-yellow-100 mt-4">
                クリックして閉じる
              </div>
            </div>
          </div>

          {/* メッセージが設定されていない場合のデフォルト表示 */}
          <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white rounded-md shadow-lg">
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">
                🎊 Level Up! 🎊
              </div>
              <div className="text-5xl font-bold mb-4">
                Lv.4
              </div>
              <div className="text-sm text-yellow-100 mt-4">
                クリックして閉じる
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">表示パターンの説明：</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>レベル2: 特別なメッセージあり（新機能解放）</li>
          <li>レベル3: 特別なメッセージあり（掲示板機能解放）</li>
          <li>レベル4: メッセージ未設定のデフォルト表示</li>
        </ul>
      </div>
    </div>
  );
}
