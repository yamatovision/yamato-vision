'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from './RichTextEditor';
import { MediaUpload } from './MediaUpload';
import { ChapterTimeSettings } from './ChapterTimeSettings';  // 変更点
import { TaskForm } from './TaskForm';  // この行を追加
import { Chapter, Task, CreateChapterDTO } from '@/types/course';  // CreateChapterDTOを追加


interface ChapterFormData {
  title: string;
  subtitle: string;
  content: {
    type: 'video' | 'audio';
    videoId: string;
    transcription: string;
  };
  timeLimit: number;
  releaseTime: number;
  orderIndex: number;
  experienceWeight: number;
  task: {
    description: string;
    materials: string;
    task: string;
    evaluationCriteria: string;
    maxPoints: number;
    systemMessage: string;
    referenceText: string;
  };
  taskContent: {
    description: string;
  };
}

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
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: {
      type: initialData?.content?.type || 'video',
      videoId: initialData?.content?.videoId || '',
      transcription: initialData?.content?.transcription || ''
    },
    timeLimit: initialData?.timeLimit || 0,
    releaseTime: initialData?.releaseTime || 0,
    orderIndex: initialData?.orderIndex || 0,
    experienceWeight: initialData?.experienceWeight || 100,
    task: {
      description: initialData?.task?.description || '',
      materials: initialData?.task?.materials || '',
      task: initialData?.task?.task || '',
      evaluationCriteria: initialData?.task?.evaluationCriteria || '',
      maxPoints: initialData?.task?.maxPoints || 100,
      systemMessage: initialData?.task?.systemMessage || '',
      referenceText: initialData?.task?.referenceText || '', // 追加
    },
    taskContent: {
      description: initialData?.taskContent?.description || ''
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
    const submitData: CreateChapterDTO = {
      title: formData.title,
      subtitle: formData.subtitle,
      content: {
        type: formData.content.type,
        videoId: formData.content.videoId,
        transcription: formData.content.transcription
      },
      timeLimit: formData.timeLimit,
      releaseTime: formData.releaseTime,
      orderIndex: formData.orderIndex,
      experienceWeight: formData.experienceWeight,
      task: {
        description: formData.task.description,
        materials: formData.task.materials,
        task: formData.task.task,
        evaluationCriteria: formData.task.evaluationCriteria,
        maxPoints: formData.task.maxPoints,
        systemMessage: formData.task.systemMessage,
        referenceText: formData.task.referenceText,
      },
      taskContent: {
        description: formData.taskContent.description
      }
      
    };

    if (initialData) {
      await courseApi.updateChapter(courseId, initialData.id, submitData);
      toast.success('チャプターを更新しました');
    } else {
      await courseApi.createChapter(courseId, submitData);
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
                      videoId: '',          // urlをvideoIdに変更
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
  currentVideoId={formData.content.videoId}
  onUpload={({ videoId }) => setFormData(prev => ({
    ...prev,
    content: {
      ...prev.content,
      videoId
    }
  }))}
  courseId={courseId}
  chapterId={initialData?.id || ''}
/>
          </div>
        </section>

       {/* 課題セクション - 更新 */}
       <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-6 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            課題設定
          </h3>

          {/* 公開用課題説明 */}
          <div className="mb-8">
            <RichTextEditor
              label="課題説明"
              value={formData.taskContent.description}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  taskContent: {
                    ...prev.taskContent,
                    description: value
                  }
                }));
              }}
              placeholder="課題の説明を入力してください"
            />
          </div>

          <TaskForm
  initialData={initialData?.task}
  onSubmit={(taskData) => {
    setFormData(prev => ({
      ...prev,
      task: {
        description: taskData.description,
        materials: taskData.materials || '',
        task: taskData.task || '',
        evaluationCriteria: taskData.evaluationCriteria || '',
        maxPoints: taskData.maxPoints,
        systemMessage: taskData.systemMessage,
        referenceText: taskData.referenceText, // 追加
      }
    }));
  }}
  disabled={isSubmitting}
/>
        </section>
        <div>
  <label className={`block text-sm font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
  }`}>
    経験値の重み付け
  </label>
  <div className="relative">
    <input
      type="number"
      value={formData.experienceWeight}
      onChange={(e) => {
        const value = Math.max(1, Math.min(1000, parseInt(e.target.value) || 100));
        setFormData(prev => ({
          ...prev,
          experienceWeight: value
        }));
      }}
      min="1"
      max="1000"
      className={`w-full rounded-lg pl-3 pr-12 py-2 ${
        theme === 'dark'
          ? 'bg-gray-700 text-white border-gray-600'
          : 'bg-white text-gray-900 border-gray-200'
      } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
    />
    <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    }`}>
      %
    </div>
  </div>
  <p className={`mt-1 text-sm ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  }`}>
    経験値の獲得量を調整します（1-1000%）
  </p>
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

