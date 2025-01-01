'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from './RichTextEditor';
import { MediaUpload } from './MediaUpload';
import { ChapterTimeSettings } from './ChapterTimeSettings';  // 変更点
import { TIME_VALIDATION } from '@/types/timeout';  // 追加

interface ChapterFormProps {
  initialData?: Chapter;
  courseId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ChapterForm({
  initialData,
  courseId,
  onCancel,
  onSuccess
}: ChapterFormProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'task'>('basic');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: {
      type: initialData?.content?.type || 'video',
      url: initialData?.content?.url || '', // 初期値を追加
      thumbnailUrl: initialData?.content?.thumbnailUrl || '', // サムネイル用に追加
      transcription: initialData?.content?.transcription || ''
    },
    timeLimit: initialData?.timeLimit || 0,
    releaseTime: initialData?.releaseTime || 0,
    orderIndex: initialData?.orderIndex || 0,
    task: {
      description: initialData?.task?.description || '',
      systemMessage: initialData?.task?.systemMessage || '',
      referenceText: initialData?.task?.referenceText || '',
      maxPoints: initialData?.task?.maxPoints || 100,
      type: initialData?.task?.type || 'standard'
    }
  });

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('コースタイトルを入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (initialData) {
        await courseApi.updateChapter(courseId, initialData.id, formData);
        toast.success('チャプターを更新しました');
      } else {
        await courseApi.createChapter(courseId, formData);
        toast.success('チャプターを作成しました');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error(initialData ? 'チャプターの更新に失敗しました' : 'チャプターの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeSettingsUpdate = async (settings: { timeLimit?: number; releaseTime?: number }) => {
    setFormData(prev => ({
      ...prev,
      timeLimit: settings.timeLimit ?? prev.timeLimit,
      releaseTime: settings.releaseTime ?? prev.releaseTime
    }));
  };



  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            基本情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                チャプタータイトル *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                サブタイトル
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
            </div>
          </div>

          <div className="mt-6">
          <ChapterTimeSettings  // ここを変更
              timeLimit={formData.timeLimit}
              releaseTime={formData.releaseTime}
              onUpdate={handleTimeSettingsUpdate}
              disabled={isSubmitting}
            />
          </div>
        </section>

        {/* メディアセクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            メディアコンテンツ
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                コンテンツタイプ *
              </label>
              <select
                value={formData.content.type}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    content: {
                      type: e.target.value as 'video' | 'audio',
                      url: '',
                      transcription: ''
                    }
                  }));
                }}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="video">動画</option>
                <option value="audio">音声</option>
              </select>
            </div>

            <MediaUpload
  type={formData.content.type}
  currentUrl={formData.content.url}
  onUpload={({ url, thumbnailUrl }) => setFormData(prev => ({
    ...prev,
    content: { 
      ...prev.content, 
      url,
      thumbnailUrl 
    }
  }))}
  courseId={courseId}
  chapterId={initialData?.id || ''}
/>
          </div>
        </section>

        {/* 課題セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            課題設定
          </h3>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                課題説明 *
              </label>
              <RichTextEditor
                value={formData.task.description}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  task: { ...prev.task, description: value }
                }))}
                placeholder="課題の説明を入力してください"
                label="課題説明"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                システムメッセージ *
              </label>
              <textarea
                value={formData.task.systemMessage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  task: { ...prev.task, systemMessage: e.target.value }
                }))}
                className={`w-full h-32 rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="AIによる採点のためのシステムメッセージを入力してください"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                参考テキスト
              </label>
              <textarea
                value={formData.task.referenceText}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  task: { ...prev.task, referenceText: e.target.value }
                }))}
                className={`w-full h-32 rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="課題の参考となるテキストを入力してください"
              />
            </div>
          </div>
        </section>

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
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
  type="submit"
  className={`px-6 py-2 rounded-lg ${
    theme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-blue-500 hover:bg-blue-600'
  } text-white transition-colors`}
  disabled={isSubmitting}
>
  {isSubmitting ? '保存中...' : '保存'}
</button>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </div>
);








}
