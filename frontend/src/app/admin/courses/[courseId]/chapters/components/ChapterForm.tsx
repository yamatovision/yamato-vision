'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from './RichTextEditor';
import { MediaUpload } from './MediaUpload';
import { TimeSettings } from './TimeSettings';

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
      url: initialData?.content?.url || '',
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
      toast.error('チャプタータイトルを入力してください');
      return false;
    }
    if (!formData.content.url) {
      toast.error('メディアコンテンツをアップロードしてください');
      return false;
    }
    if (!formData.task.description.trim()) {
      toast.error('課題説明を入力してください');
      return false;
    }
    if (!formData.task.systemMessage.trim()) {
      toast.error('システムメッセージを入力してください');
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
      timeLimit: settings.timeLimit || 0,
      releaseTime: settings.releaseTime || 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['basic', 'media', 'task'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? `${theme === 'dark' 
                      ? 'border-blue-500 text-blue-400' 
                      : 'border-blue-500 text-blue-600'}`
                  : `${theme === 'dark'
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {tab === 'basic' ? '基本情報' : tab === 'media' ? 'メディア' : '課題'}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* 基本情報入力フォーム */}
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

            <TimeSettings
              timeLimit={formData.timeLimit}
              releaseTime={formData.releaseTime}
              onUpdate={handleTimeSettingsUpdate}
              disabled={isSubmitting}
            />
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
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
              onUpload={(url) => setFormData(prev => ({
                ...prev,
                content: { ...prev.content, url }
              }))}
              courseId={courseId}
              chapterId={initialData?.id || 'new'}
            />
          </div>
        )}

        {activeTab === 'task' && (
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
        )}

        <div className="flex justify-end space-x-4 pt-6">
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
            {isSubmitting ? '保存中...' : (initialData ? '更新' : '作成')}
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
