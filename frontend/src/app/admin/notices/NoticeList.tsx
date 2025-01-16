// frontend/src/app/admin/notices/NoticeList.tsx
'use client';

import { useState, useEffect } from 'react';
import { noticeApi } from '@/lib/api/notices';
import { Notice, NOTICE_TYPE_CONFIG } from '@/types/notice';
import { useToast } from '@/contexts/toast';
import { format } from 'date-fns';
import { NoticeForm } from './NoticeForm';

export function NoticeList() {
  const { showToast } = useToast();
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
      fetchNotices(); // 一覧を再取得
    } catch (error) {
      console.error('Failed to delete notice:', error);
      showToast('お知らせの削除に失敗しました', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="animate-pulse p-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      {/* お知らせ一覧テーブル */}
      <div className="bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
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
          <tbody className="bg-white divide-y divide-gray-200">
            {notices.map((notice) => {
              const now = new Date();
              const startAt = new Date(notice.startAt);
              const endAt = new Date(notice.endAt);
              const isActive = notice.isActive && startAt <= now && now <= endAt;

              return (
                <tr key={notice.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      NOTICE_TYPE_CONFIG[notice.type].borderColor.replace('border', 'bg')
                    } bg-opacity-10 text-gray-800`}>
                      {NOTICE_TYPE_CONFIG[notice.type].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(startAt, 'yyyy/MM/dd HH:mm')}
                      <br />
                      ～ {format(endAt, 'yyyy/MM/dd HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {notice.excludedRanks.length > 0 ? (
                        <>
                          <div>除外: {notice.excludedRanks.join(', ')}</div>
                        </>
                      ) : (
                        '制限なし'
                      )}
                      {notice.minLevel && (
                        <div className="text-sm text-gray-500">
                          Lv.{notice.minLevel}以上
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:text-red-900"
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
          <div className="text-center py-8 text-gray-500">
            お知らせはありません
          </div>
        )}
      </div>

      {/* モーダルフォーム */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <NoticeForm 
              noticeId={selectedNotice?.id ?? null} 
              onClose={() => {
                setIsFormOpen(false);
                setSelectedNotice(null);
                fetchNotices(); // 一覧を更新
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}