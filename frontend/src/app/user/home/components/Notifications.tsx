// frontend/src/app/user/home/components/Notifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { noticeApi } from '@/lib/api/notices';
import { Notice, NOTICE_TYPE_CONFIG } from '@/types/notice';
import { format } from 'date-fns';

export function Notifications() {
  const { theme } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const response = await noticeApi.getActive();
        setNotices(response.data.data);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setError('お知らせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchNotices();
  }, []);
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
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>お知らせ</h2>
      
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            現在お知らせはありません
          </div>
        ) : (
          notices.map((notice) => (
            <div 
              key={notice.id}
              className={`border-l-4 ${NOTICE_TYPE_CONFIG[notice.type].borderColor} pl-3 py-2`}
            >
              <div className={`font-bold ${
                theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
              }`}>{notice.title}</div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {format(new Date(notice.startAt), 'yyyy/MM/dd')}
              </div>
              <div className={`mt-1 text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {notice.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}