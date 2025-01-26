'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { noticeApi } from '@/lib/api/notices';
import { Notice, NOTICE_TYPE_CONFIG } from '@/types/notice';
import { format } from 'date-fns';
import { NoticeDetailModal } from './NoticeDetailModal';

export function Notifications() {
  const { theme } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const response = await noticeApi.getActive();
        const fiftyDaysFromNow = new Date();
        fiftyDaysFromNow.setDate(fiftyDaysFromNow.getDate() + 50);
        
        const filteredNotices = response.data.data
          .filter((notice: Notice) => {
            const endDate = new Date(notice.endAt);
            return endDate <= fiftyDaysFromNow;
          })
          .sort((a, b) => {
            // startAtで昇順ソート（古い日付が上に来る）
            return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
          });
        
        setNotices(filteredNotices);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setError('お知らせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchNotices();
  }, []);
  const handleAction = (notice: Notice) => {
    // contentがある場合は必ずモーダルを開く
    if (notice.content) {
      setSelectedNotice(notice);
    } else if (notice.buttonUrl) {
      // contentがなく、リンクのみの場合は直接リンクを開く
      window.open(notice.buttonUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>イベント情報</h2>
        
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              現在お知らせはありません
            </div>
          ) : (
            notices.map((notice) => {
              const config = NOTICE_TYPE_CONFIG[notice.type];
              return (
                <div 
                  key={notice.id}
                  className={`${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  } rounded-lg p-4 hover:transform hover:scale-[1.02] transition-transform cursor-pointer`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                      }`}>{notice.title}</h3>
                
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white ${
                      theme === 'dark' ? config.darkBgColor : config.bgColor
                    }`}>
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {notice.menuContent || notice.content}
                  </p>
                  <div className="flex justify-between items-center">
  <span className={`text-xs ${
    theme === 'dark' ? 'text-green-400' : 'text-green-600'
  }`}>
    参加受付中
  </span>
  <button
    onClick={() => handleAction(notice)}
    className={`px-3 py-1 rounded text-sm ${
      theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-400 hover:bg-blue-500 text-white'
    } transition-colors`}
  >
    {notice.content ? '詳細を見る' : notice.buttonText || '詳細を見る'}
  </button>
</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* モーダル */}
      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </>
  );
}