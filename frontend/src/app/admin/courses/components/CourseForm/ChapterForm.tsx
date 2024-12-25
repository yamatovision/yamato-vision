'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { FileUpload } from '../shared/FileUpload';
import { RichTextEditor } from '../shared/RichTextEditor';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/api';
import { toast } from 'react-hot-toast';

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
  const [contentFile, setContentFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: {
      type: initialData?.content?.type || 'video',
      url: initialData?.content?.url || '',
      transcription: initialData?.content?.transcription || ''
    },
    timeLimit: initialData?.timeLimit || 0,
    waitTime: initialData?.waitTime || 0,
    initialWait: initialData?.initialWait || 0,
    orderIndex: initialData?.orderIndex || 0,
    task: {
      description: initialData?.task?.description || '',
      systemMessage: initialData?.task?.systemMessage || '',
      referenceText: initialData?.task?.referenceText || '',
      maxPoints: initialData?.task?.maxPoints || 100,
      type: initialData?.task?.type || 'standard' // typeプロパティを追加
    }
  });

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('チャプタータイトルを入力してください');
      return false;
    }
    if (!formData.task.description.trim()) {
      toast.error('課題説明を入力してください');
      return false;
    }
    if (!formData.content.url && !contentFile) {
      toast.error(`${formData.content.type === 'video' ? '動画' : '音声'}ファイルを選択してください`);
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let contentUrl = formData.content.url;
      if (contentFile) {
        contentUrl = await uploadToCloudinary(
          contentFile,
          `courses/${courseId}/chapters/${formData.content.type}`
        );
      }

      const dataToSubmit = {
        ...formData,
        content: {
          ...formData.content,
          url: contentUrl,
        },
      };

      if (initialData) {
        await courseApi.updateChapter(courseId, initialData.id, dataToSubmit);
        toast.success('チャプターを更新しました');
      } else {
        await courseApi.createChapter(courseId, dataToSubmit);
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

  const getAcceptFileType = () => {
    return formData.content.type === 'video' 
      ? 'video/mp4,video/quicktime,video/webm'
      : 'audio/mpeg,audio/wav,audio/mp3';
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                content: { ...prev.content, type: e.target.value as 'video' | 'audio', url: '' }
              }));
              setContentFile(null);
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

        <FileUpload
          accept={getAcceptFileType()}
          onUpload={setContentFile}
          currentUrl={formData.content.url}
          label={`${formData.content.type === 'video' ? '動画' : '音声'}ファイル *`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            制限時間（分）
          </label>
          <input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            min="0"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            待機時間（分）
          </label>
          <input
            type="number"
            value={formData.waitTime}
            onChange={(e) => setFormData(prev => ({ ...prev, waitTime: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            min="0"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            初期待機時間（分）
          </label>
          <input
            type="number"
            value={formData.initialWait}
            onChange={(e) => setFormData(prev => ({ ...prev, initialWait: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            min="0"
          />
        </div>
      </div>

      <div className="space-y-4">
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
          {isSubmitting ? '保存中...' : (initialData ? '更新' : '作成')}
        </button>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </form>
  );
}
