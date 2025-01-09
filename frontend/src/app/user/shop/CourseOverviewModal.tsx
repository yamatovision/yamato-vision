// frontend/src/app/shop/PurchaseSuccessModal.tsx
'use client';

import { useTheme } from '@/contexts/theme';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onStart: () => void;
}

export function PurchaseSuccessModal({ 
  isOpen, 
  onClose, 
  courseTitle,
  onStart 
}: PurchaseSuccessModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        rounded-lg p-6 max-w-md w-full mx-4 text-center
      `}>
        <div className="text-4xl mb-4 animate-bounce">🎉</div>
        <h3 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          おめでとうございます！
        </h3>
        <p className={`mb-2 font-medium ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`}>
          『{courseTitle}』
        </p>
        <p className={`mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          を解放しました！
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            後で始める
          </button>
          <button
            onClick={onStart}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            今すぐ始める
          </button>
        </div>
      </div>
    </div>
  );
}