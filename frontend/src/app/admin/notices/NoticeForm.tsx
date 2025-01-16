'use client';

import { useState, useEffect } from 'react';
import { noticeApi } from '@/lib/api/notices';
import { 
  CreateNoticeDto, 
  NOTICE_TYPES, 
  USER_RANKS, 
  NoticeType, 
  UserRank,
  Notice 
} from '@/types/notice';
import { useToast } from '@/contexts/toast';

interface NoticeFormProps {
  noticeId: string | null;
  onClose: () => void;
}

export function NoticeForm({ noticeId, onClose }: NoticeFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateNoticeDto>({
    title: '',
    content: '',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    type: NOTICE_TYPES.INFO,
    excludedRanks: [],
    minLevel: undefined
  });

  useEffect(() => {
    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      setIsLoading(true);
      const response = await noticeApi.getAll();
      const notice = response.data.data.find((n: Notice) => n.id === noticeId);
      if (notice) {
        setFormData({
          title: notice.title,
          content: notice.content,
          startAt: notice.startAt.slice(0, 16),
          endAt: notice.endAt.slice(0, 16),
          type: notice.type,
          excludedRanks: notice.excludedRanks,
          minLevel: notice.minLevel
        });
      }
    } catch (error) {
      console.error('Failed to fetch notice:', error);
      showToast('お知らせの取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRankToggle = (rank: UserRank) => {
    setFormData(prev => ({
      ...prev,
      excludedRanks: prev.excludedRanks.includes(rank)
        ? prev.excludedRanks.filter(r => r !== rank)
        : [...prev.excludedRanks, rank]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (noticeId) {
        await noticeApi.update(noticeId, formData);
        showToast('お知らせを更新しました', 'success');
      } else {
        await noticeApi.create(formData);
        showToast('お知らせを作成しました', 'success');
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save notice:', error);
      showToast('お知らせの保存に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {noticeId ? 'お知らせ編集' : 'お知らせ新規作成'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">閉じる</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              種別
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(NOTICE_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* 表示期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              表示期間
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              本文
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* ランク除外設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              表示しないランク
            </label>
            <div className="mt-2 space-x-4">
              {Object.values(USER_RANKS).map((rank) => (
                <label key={rank} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.excludedRanks.includes(rank)}
                    onChange={() => handleRankToggle(rank as UserRank)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {rank}を除外
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* レベル制限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              最小レベル制限（オプション）
            </label>
            <input
              type="number"
              value={formData.minLevel || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                minLevel: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min="1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : (noticeId ? '更新する' : '作成する')}
          </button>
        </div>
      </form>
    </div>
  );
}