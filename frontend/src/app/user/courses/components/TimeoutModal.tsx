'use client';

import { useTheme } from '@/contexts/theme';

interface TimeoutModalProps {
  isOpen: boolean;
  type: 'chapter' | 'course';
  onClose: () => void;
  onAction?: () => void;
  courseTitle?: string; // コースタイトルを追加
}

export function TimeoutModal({ 
  isOpen, 
  type, 
  onClose,
  onAction,
  courseTitle 
}: TimeoutModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getMessage = () => {
    if (type === 'chapter') {
      return {
        title: 'チャプターの制限時間を超過しました',
        description: '以降の課題提出は減点対象となります。',
        action: '理解しました'
      };
    } else {
      return {
        title: 'コース受講期限超過',
        description: courseTitle 
          ? `『${courseTitle}』の受講期限が超過したため、コース受講は取り消されました。`
          : 'コースの受講期限が超過したため、受講は取り消されました。',
        subDescription: '再受講はいつでも可能ですが、認定資格は取り消されます。',
        action: 'ショップへ移動'
      };
    }
  };

  const message = getMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        rounded-lg p-6 max-w-md w-full mx-4
      `}>
        <h3 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {message.title}
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {message.description}
        </p>
        {type === 'course' && (
          <p className="text-yellow-600 mb-4">
            {message.subDescription}
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
            閉じる
          </button>
          {onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {message.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}