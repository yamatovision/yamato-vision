'use client';

import { useTheme } from '@/contexts/theme';
import { Notice, NOTICE_TYPE_CONFIG } from '@/types/notice';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface NoticeDetailModalProps {
  notice: Notice;
  onClose: () => void;
}

export function NoticeDetailModal({ notice, onClose }: NoticeDetailModalProps) {
  const { theme } = useTheme();
  const config = NOTICE_TYPE_CONFIG[notice.type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-center justify-center">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* モーダルコンテンツ */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`relative w-full max-w-2xl rounded-xl shadow-xl overflow-hidden my-8 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                    }`}>
                      {notice.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${
                      theme === 'dark' ? config.darkBgColor : config.bgColor
                    }`}>
                      {config.label}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {format(new Date(notice.startAt), 'yyyy/MM/dd HH:mm')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`absolute right-4 top-4 p-2 rounded-full 
                    ${theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <div className={`prose max-w-none ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {notice.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-4">{line}</p>
                ))}
              </div>
            </div>

        {/* フッター */}
<div className={`p-6 border-t ${
  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
}`}>
  {/* ボタンのみ表示 */}
  <div className="flex justify-end">
    <button
      onClick={() => {
        if (notice.buttonUrl) {
          window.open(notice.buttonUrl, '_blank');
        }
        onClose();
      }}
      className={`px-4 py-2 rounded-lg font-medium ${
        theme === 'dark'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } transition-colors`}
    >
      {notice.buttonText || '閉じる'}
    </button>
  </div>
</div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}