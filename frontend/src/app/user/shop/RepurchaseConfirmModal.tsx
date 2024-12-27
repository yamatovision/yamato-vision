// frontend/src/app/shop/RepurchaseConfirmModal.tsx
'use client';

import { useTheme } from '@/contexts/theme';

interface RepurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  gemCost: number;
  onConfirm: () => void;
}

export function RepurchaseConfirmModal({ 
  isOpen, 
  onClose, 
  courseTitle,
  gemCost,
  onConfirm 
}: RepurchaseConfirmModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        rounded-lg p-6 max-w-md w-full mx-4
      `}>
        <h3 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          コースを再購入しますか？
        </h3>
        <p className={`mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          『{courseTitle}』を再購入します。
        </p>
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span className="text-yellow-400 text-xl">💎</span>
          <span className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>
            {gemCost}
          </span>
          <span className={
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }>ジェム</span>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再購入する
          </button>
        </div>
      </div>
    </div>
  );
}