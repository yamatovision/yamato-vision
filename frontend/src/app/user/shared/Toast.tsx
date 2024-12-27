'use client';

interface LevelUpData {
  oldLevel: number;  // 追加
  newLevel: number;
  message: string | null;  // 管理画面で設定したメッセージ用
  experienceGained?: number;  // 追加：獲得経験値表示用
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'levelUp';
  onClose: () => void;
  levelUpData?: LevelUpData;
}

export function Toast({ message, type, onClose, levelUpData }: ToastProps) {
  const baseStyle = "p-4 rounded-md shadow-lg flex items-center justify-between";
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white",
    levelUp: "bg-gradient-to-r from-yellow-600 to-yellow-400 text-white"
  };

  if (type === 'levelUp' && levelUpData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="max-w-md mx-auto w-full px-4">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg p-6 text-center text-white">
            <div className="text-2xl mb-2">🎊 Level Up! 🎊</div>
            
            <div className="text-3xl font-bold mb-4">
              Lv.{levelUpData.oldLevel} → Lv.{levelUpData.newLevel}
            </div>

            {/* 獲得経験値の表示（オプション） */}
            {levelUpData.experienceGained && (
              <div className="bg-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="text-lg font-bold">獲得経験値</div>
                <div className="text-2xl text-yellow-100">
                  +{levelUpData.experienceGained} EXP
                </div>
              </div>
            )}
            
            {/* レベルメッセージ */}
            <div className="text-lg bg-yellow-500/30 rounded-lg p-3 mb-6">
              {levelUpData.message || 'おめでとうございます！'}
            </div>
            
            {/* アクションボタン */}
            <button
              onClick={onClose}
              className="w-full bg-white text-yellow-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              次へ進む
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 通常のトースト表示（変更なし）
  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}