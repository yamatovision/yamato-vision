'use client';

import { useState } from 'react';

interface NoticeFormProps {
  noticeId: string | null;
}

interface Restrictions {
  ranks: string[];
  levelRange: {
    min: string;
    max: string;
  };
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

  const ranks = ['初級', '中級', '上級', '超級'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // 画像アップロード処理
      console.log('Upload file:', e.target.files[0]);
    }
  };

  const handleRankChange = (rank: string) => {
    const newRanks = formData.restrictions.ranks.includes(rank)
      ? formData.restrictions.ranks.filter(r => r !== rank)
      : [...formData.restrictions.ranks, rank];
    
    setFormData({
      ...formData,
      restrictions: {
        ...formData.restrictions,
        ranks: newRanks
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">基本情報</h3>
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
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">画像アップロード</h3>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4A90E2] file:text-white hover:file:bg-[#357ABD]"
          />
        </div>
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`アップロード ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...formData.images];
                    newImages.splice(index, 1);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 表示制限設定 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">表示制限設定</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#2C3E50]">階級制限</label>
            <div className="mt-2 space-x-4">
              {ranks.map((rank) => (
                <label key={rank} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.restrictions.ranks.includes(rank)}
                    onChange={() => handleRankChange(rank)}
                    className="rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2]"
                  />
                  <span className="ml-2 text-sm text-[#2C3E50]">{rank}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#2C3E50]">レベル制限</label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.restrictions.levelRange.min}
                onChange={(e) => setFormData({
                  ...formData,
                  restrictions: {
                    ...formData.restrictions,
                    levelRange: {
                      ...formData.restrictions.levelRange,
                      min: e.target.value
                    }
                  }
                })}
                placeholder="最小レベル"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
              <input
                type="number"
                value={formData.restrictions.levelRange.max}
                onChange={(e) => setFormData({
                  ...formData,
                  restrictions: {
                    ...formData.restrictions,
                    levelRange: {
                      ...formData.restrictions.levelRange,
                      max: e.target.value
                    }
                  }
                })}
                placeholder="最大レベル"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-[#2C3E50] hover:bg-gray-50"
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
