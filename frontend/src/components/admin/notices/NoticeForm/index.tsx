'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { Restrictions } from './Restrictions';

interface NoticeFormProps {
  noticeId: string | null;
}

export function NoticeForm({ noticeId }: NoticeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startAt: '',
    endAt: '',
    images: [] as string[],
    restrictions: {
      ranks: [] as string[],
      levelRange: {
        min: '',
        max: ''
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C3E50]">
              タイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C3E50]">
              表示期間
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                required
              />
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C3E50]">
              本文
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              required
            />
          </div>
        </div>
      </div>

      {/* 画像アップロード */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </div>

      {/* 表示制限設定 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Restrictions
          value={formData.restrictions}
          onChange={(restrictions) => setFormData({ ...formData, restrictions })}
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-[#2C3E50] hover:bg-gray-50"
          onClick={() => window.history.back()}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
        >
          保存する
        </button>
      </div>
    </form>
  );
}
