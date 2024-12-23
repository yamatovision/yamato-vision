'use client';
import { useState } from 'react';
import { useToast } from '@/contexts/toast';
import { levelMessageAPI } from '@/lib/api/levelMessages';
import { LevelMessage, LevelMessageFormData } from '@/types/levelMessage';

interface Props {
  message?: LevelMessage;
  onClose: () => void;
}

export function LevelMessageForm({ message, onClose }: Props) {
  const [formData, setFormData] = useState<LevelMessageFormData>({
    level: message?.level ?? 1,
    message: message?.message ?? '',
    isActive: message?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (message) {
        const response = await levelMessageAPI.update(message.id, formData);
        if (response.data.success) {
          showToast('メッセージを更新しました', 'success');
          onClose();
        }
      } else {
        const response = await levelMessageAPI.create({
          level: formData.level,
          message: formData.message
        });
        if (response.data.success) {
          showToast('メッセージを作成しました', 'success');
          onClose();
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string }; }; message?: string };
      showToast(
        `${message ? '更新' : '作成'}に失敗しました: ${err.response?.data?.message || err.message || '不明なエラー'}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {message ? 'レベルメッセージ編集' : '新規メッセージ作成'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レベル
            </label>
            <input
              type="number"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メッセージ
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              有効にする
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '処理中...' : message ? '更新する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}