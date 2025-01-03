'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/course';
import { courseApi, uploadToCloudinary } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FileUpload } from './FileUpload';

interface CourseFormProps {
  initialData?: Course;
  isEdit?: boolean;
}

// 階級の優先順位を定義
const RANK_PRIORITIES = {
  'お試し': { value: 'お試し', label: 'お試し', priority: 1 },
  '初伝': { value: '初伝', label: '初伝', priority: 2 },
  '中伝': { value: '中伝', label: '中伝', priority: 3 },
  '奥伝': { value: '奥伝', label: '奥伝', priority: 4 },
  '皆伝': { value: '皆伝', label: '皆伝', priority: 5 }
} as const;

// 選択した階級以上のランクを取得する関数
const getHigherRanks = (selectedRank: string): string => {
  if (!selectedRank) return '';
  
  const priority = RANK_PRIORITIES[selectedRank as keyof typeof RANK_PRIORITIES]?.priority;
  if (priority === undefined) return '';

  return Object.entries(RANK_PRIORITIES)
    .filter(([_, rank]) => rank.priority >= priority)
    .map(([_, rank]) => rank.label)
    .join('、');
};

export function CourseForm({ initialData, isEdit = false }: CourseFormProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    levelRequired: initialData?.levelRequired || 0,
    rankRequired: initialData?.rankRequired || '',
    timeLimit: initialData?.timeLimit || 0,
    requirementType: initialData?.requirementType || 'AND',
  });

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('コースタイトルを入力してください');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('説明文を入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(thumbnailFile, 'course-thumbnails');
      }

      const dataToSubmit = {
        ...formData,
        thumbnail: thumbnailUrl,
      };

      if (isEdit && initialData?.id) {
        await courseApi.updateCourse(initialData.id, dataToSubmit);
        toast.success('コースを更新しました');
        router.refresh();
      } else {
        const response = await courseApi.createCourse(dataToSubmit);
        toast.success('コースを作成しました');
        router.push(`/admin/courses/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isEdit ? 'コースの更新に失敗しました' : 'コースの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* サムネイル アップロード */}
      <div>
        <FileUpload
          accept="image/*"
          onUpload={setThumbnailFile}
          currentUrl={formData.thumbnail}
          label="コースサムネイル"
        />
      </div>

      {/* コースタイトル */}
      <div>
        <label 
          className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          コースタイトル
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

      {/* 説明文 */}
      <div>
        <label 
          className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          説明文
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark' 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          required
        />
      </div>

      {/* 受講条件設定 */}
      <div className="space-y-4">
        <h3 className={`font-medium ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          受講条件設定
        </h3>
        
        {/* 条件判定方式 */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            条件判定方式
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="AND"
                checked={formData.requirementType === 'AND'}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementType: e.target.value }))}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                レベルと階級の両方を満たす（AND）
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="OR"
                checked={formData.requirementType === 'OR'}
                onChange={(e) => setFormData(prev => ({ ...prev, requirementType: e.target.value }))}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                レベルまたは階級のいずれかを満たす（OR）
              </span>
            </label>
          </div>
        </div>

        {/* レベルと階級の設定 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              必要レベル
            </label>
            <input
              type="number"
              value={formData.levelRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, levelRequired: parseInt(e.target.value) }))}
              className={`w-full rounded-lg p-3 ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-200'
              } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              min="0"
            />
          </div>

          <div>
            <label 
              className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              必要階級
            </label>
            <div className="space-y-2">
              <select
                value={formData.rankRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, rankRequired: e.target.value }))}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">選択してください</option>
                {Object.values(RANK_PRIORITIES).map(rank => (
                  <option key={rank.value} value={rank.value}>
                    {rank.label}
                  </option>
                ))}
              </select>
              {formData.rankRequired && (
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  受講可能な階級: {getHigherRanks(formData.rankRequired)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 制限時間設定 */}
      <div>
        <label 
          className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          制限時間（日）
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

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
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
          {isSubmitting ? '保存中...' : (isEdit ? '更新' : '作成')}
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