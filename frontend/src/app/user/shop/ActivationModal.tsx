'use client';

import { useTheme } from '@/contexts/theme';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasCurrentCourse: boolean;
}

export function ActivationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  hasCurrentCourse 
}: ActivationModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 max-w-md w-full mx-4`}>
        <h3 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          コースを開始しますか？
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          コースは1つずつしか受講できません。
        </p>
        {hasCurrentCourse && (
          <p className="text-red-500 mb-4">
            ※現在受講中のコースは退学扱いとなります。
          </p>
        )}
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
            開始する
          </button>
        </div>
      </div>
    </div>
  );
}
