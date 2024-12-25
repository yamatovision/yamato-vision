'use client';

import { useTheme } from '@/contexts/theme';
import { Task } from '@/types/course';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'react-hot-toast';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (taskData: Omit<Task, 'id'>) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  disabled = false
}: TaskFormProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    systemMessage: initialData?.systemMessage || '',
    referenceText: initialData?.referenceText || '',
    maxPoints: initialData?.maxPoints || 100,
    type: initialData?.type || 'standard'
  });

  const taskTypes = [
    { value: 'standard', label: '標準課題' },
    { value: 'code', label: 'コーディング課題' },
    { value: 'report', label: 'レポート課題' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting) return;

    // バリデーション
    if (!formData.description.trim()) {
      toast.error('課題の説明を入力してください');
      return;
    }
    if (!formData.systemMessage.trim()) {
      toast.error('システムメッセージを入力してください');
      return;
    }
    if (formData.maxPoints < 1 || formData.maxPoints > 100) {
      toast.error('最高得点は1から100の間で設定してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(initialData ? '課題を更新しました' : '課題を作成しました');
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('課題の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 課題タイプ選択 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          課題タイプ *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className={`w-full rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          disabled={disabled}
        >
          {taskTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 課題説明 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          課題説明 *
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="課題の説明を入力してください"
          label="課題説明"
        />
      </div>

      {/* システムメッセージ */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          システムメッセージ *
        </label>
        <textarea
          value={formData.systemMessage}
          onChange={(e) => setFormData(prev => ({ ...prev, systemMessage: e.target.value }))}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="AIによる採点のためのシステムメッセージを入力してください"
          disabled={disabled}
          required
        />
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          採点基準や評価ポイントを具体的に記述してください
        </p>
      </div>

      {/* 参考テキスト */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          参考テキスト
        </label>
        <textarea
          value={formData.referenceText}
          onChange={(e) => setFormData(prev => ({ ...prev, referenceText: e.target.value }))}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="課題の参考となるテキストを入力してください"
          disabled={disabled}
        />
      </div>

      {/* 最高得点設定 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          最高得点 *
        </label>
        <input
          type="number"
          value={formData.maxPoints}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            maxPoints: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
          }))}
          min="1"
          max="100"
          className={`w-full rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          disabled={disabled}
          required
        />
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          1から100の間で設定してください
        </p>
      </div>

      {/* 採点ガイドライン */}
      <div className={`rounded-lg p-4 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          採点のガイドライン
        </h4>
        <ul className={`text-sm space-y-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <li>• システムメッセージには具体的な採点基準を記述してください</li>
          <li>• 参考テキストは採点の基準となる模範解答や重要なポイントを含めてください</li>
          <li>• 制限時間を超過した場合、得点は自動的に1/3になります</li>
        </ul>
      </div>

      {/* 操作ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors`}
          disabled={disabled || isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className={`px-6 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors ${
            (disabled || isSubmitting) && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? '保存中...' : (initialData ? '更新' : '作成')}
        </button>
      </div>
    </form>
  );
}