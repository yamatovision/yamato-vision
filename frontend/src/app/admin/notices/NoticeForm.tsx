'use client';

import { useState, useEffect } from 'react';
import { noticeApi } from '@/lib/api/notices';
import { CreateNoticeDto, NOTICE_TYPES, USER_RANKS, NoticeType, UserRank, Notice, NOTICE_TYPE_CONFIG } from '@/types/notice';
import { useToast } from '@/contexts/toast';
import { useTheme } from '@/contexts/theme';

interface NoticeFormProps {
  noticeId: string | null;
  onClose: () => void;
}

export function NoticeForm({ noticeId, onClose }: NoticeFormProps) {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateNoticeDto>({
    title: '',
    content: '',
    menuContent: '',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    type: NOTICE_TYPES.INFO,
    excludedRanks: [],
    buttonUrl: '',
    buttonText: '',
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
          ...notice,
          startAt: notice.startAt.slice(0, 16),
          endAt: notice.endAt.slice(0, 16),
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
    <div className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {noticeId ? 'お知らせ編集' : 'お知らせ新規作成'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={`text-gray-400 hover:text-gray-500 ${
            theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'
          }`}
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
            <label className="block text-sm font-medium">
              タイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>

          {/* 種別 */}
          <div>
            <label className="block text-sm font-medium">
              種別
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            >
              {Object.entries(NOTICE_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {NOTICE_TYPE_CONFIG[value].label}
                </option>
              ))}
            </select>
          </div>

          {/* 表示期間 */}
          <div>
            <label className="block text-sm font-medium">
              表示期間
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
                required
              />
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>
          </div>

          {/* メニュー用説明文 */}
          <div>
            <label className="block text-sm font-medium">
              メニュー用説明文（40文字以内）
            </label>
            <textarea
              value={formData.menuContent}
              onChange={(e) => {
                const text = e.target.value;
                if (text.length <= 40) {
                  setFormData({ ...formData, menuContent: text });
                }
              }}
              rows={2}
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="メニューに表示される短い説明文を入力してください"
            />
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formData.menuContent?.length || 0}/40文字
            </p>
          </div>

         {/* 詳細内容 */}
<div>
  <label className="block text-sm font-medium">
    詳細内容（オプション）
  </label>
  <textarea
    value={formData.content}
    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
    rows={5}
    className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
      theme === 'dark' 
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'border-gray-300 text-gray-900'
    }`}
    placeholder="詳細な説明が必要な場合に入力してください"
  />
</div>

          {/* ボタン設定 */}
          <div>
            <label className="block text-sm font-medium">
              ボタン設定（オプション）
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={formData.buttonUrl || ''}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
                placeholder="リンク先URL"
              />
              <input
                type="text"
                value={formData.buttonText || ''}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                }`}
                placeholder="ボタンのテキスト（例：詳細を見る）"
              />
            </div>
          </div>

          {/* ランク除外設定 */}
          <div>
            <label className="block text-sm font-medium">
              表示しないランク
            </label>
            <div className="mt-2 space-x-4">
              {Object.values(USER_RANKS).map((rank) => (
                <label key={rank} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.excludedRanks.includes(rank)}
                    onChange={() => handleRankToggle(rank as UserRank)}
                    className={`rounded border-gray-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white'
                    }`}
                  />
                  <span className="ml-2 text-sm">
                    {rank}を除外
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* レベル制限 */}
          <div>
            <label className="block text-sm font-medium">
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
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              theme === 'dark'
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : (noticeId ? '更新する' : '作成する')}
          </button>
        </div>
      </form>
    </div>
  );
}