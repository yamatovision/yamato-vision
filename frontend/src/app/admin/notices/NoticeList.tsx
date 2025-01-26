'use client';

import { useState, useEffect } from 'react';
import { noticeApi } from '@/lib/api/notices';
import { Notice, NOTICE_TYPE_CONFIG, NoticeType } from '@/types/notice';
import { useToast } from '@/contexts/toast';
import { format } from 'date-fns';
import { NoticeForm } from './NoticeForm';
import { useTheme } from '@/contexts/theme';

export function NoticeList() {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await noticeApi.getAll();
      setNotices(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      showToast('お知らせの取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除してよろしいですか？')) {
      return;
    }

    try {
      await noticeApi.delete(id);
      showToast('お知らせを削除しました', 'success');
      fetchNotices();
    } catch (error) {
      console.error('Failed to delete notice:', error);
      showToast('お知らせの削除に失敗しました', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 新規作成ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedNotice(null);
            setIsFormOpen(true);
          }}
          className={`px-4 py-2 rounded-md text-white ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          新規作成
        </button>
      </div>

      {/* お知らせ一覧 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                表示期間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                表示制限
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {notices.map((notice) => {
              const now = new Date();
              const startAt = new Date(notice.startAt);
              const endAt = new Date(notice.endAt);
              const isActive = notice.isActive && startAt <= now && now <= endAt;
              const config = NOTICE_TYPE_CONFIG[notice.type as NoticeType];

              return (
                <tr key={notice.id} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notice.title}
                      {notice.buttonText && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({notice.buttonText})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs text-white ${
                      theme === 'dark' ? config.darkBgColor : config.bgColor
                    }`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {format(startAt, 'yyyy/MM/dd HH:mm')}
                      <br />
                      ～ {format(endAt, 'yyyy/MM/dd HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {notice.excludedRanks.length > 0 ? (
                        <>
                          <div>除外: {notice.excludedRanks.join(', ')}</div>
                        </>
                      ) : (
                        '制限なし'
                      )}
                      {notice.minLevel && (
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Lv.{notice.minLevel}以上
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isActive 
                        ? theme === 'dark'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-green-100 text-green-800'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? '表示中' : '非表示'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedNotice(notice);
                        setIsFormOpen(true);
                      }}
                      className={`text-blue-500 hover:text-blue-600 mr-4 ${
                        theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-700'
                      }`}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className={`text-red-500 hover:text-red-600 ${
                        theme === 'dark' ? 'hover:text-red-400' : 'hover:text-red-700'
                      }`}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {notices.length === 0 && (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            お知らせはありません
          </div>
        )}
      </div>

      {/* モーダルフォーム */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <NoticeForm 
              noticeId={selectedNotice?.id ?? null} 
              onClose={() => {
                setIsFormOpen(false);
                setSelectedNotice(null);
                fetchNotices();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}