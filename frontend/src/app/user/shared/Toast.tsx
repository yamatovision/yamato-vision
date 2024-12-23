// frontend/src/app/user/shared/Toast.tsx
'use client';

interface LevelUpData {
  newLevel: number;
  specialUnlock?: string;
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
      <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className={`${baseStyle} ${typeStyles[type]} transform transition-all duration-300 scale-100 hover:scale-105`}>
          <div className="text-center w-full">
            <div className="text-4xl font-bold mb-4">
              🎊 Level Up! 🎊
            </div>
            
            <div className="text-5xl font-bold mb-4">
              Lv.{levelUpData.newLevel}
            </div>
            
            {levelUpData.specialUnlock ? (
              <div className="text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4">
                🎉 {levelUpData.specialUnlock} 🎉
              </div>
            ) : (
              <div className="text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4">
                🎉 おめでとうございます！！ 🎉
              </div>
            )}
            
            <div className="text-sm text-yellow-100 mt-4">
              クリックして閉じる
            </div>
          </div>
        </div>
      </div>
    );
  }

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
