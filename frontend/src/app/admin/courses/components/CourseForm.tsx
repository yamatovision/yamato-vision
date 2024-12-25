'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/course';
import { courseApi, uploadToCloudinary } from '@/lib/api';  // uploadToCloudinaryをimport
import { toast } from 'react-hot-toast';
import { FileUpload } from './FileUpload';

interface CourseFormProps {
  initialData?: Course;
  isEdit?: boolean;
}

export function CourseForm({ initialData, isEdit = false }: CourseFormProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    gemCost: initialData?.gemCost || 0,
    levelRequired: initialData?.levelRequired || 0,
    rankRequired: initialData?.rankRequired || '',
    timeLimit: initialData?.timeLimit || 0,
    passingScore: initialData?.passingScore || 60,
    excellentScore: initialData?.excellentScore || 95,
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
    if (formData.gemCost < 0) {
      toast.error('必要ジェム数は0以上を指定してください');
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

      const response = isEdit 
        ? await courseApi.updateCourse(initialData!.id, dataToSubmit)
        : await courseApi.createCourse(dataToSubmit);

      toast.success(isEdit ? 'コースを更新しました' : 'コースを作成しました');
      router.push(`/admin/courses/${response.data.id}`);
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isEdit ? 'コースの更新に失敗しました' : 'コースの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rankOptions = [
    { value: '', label: '選択してください' },
    { value: 'お試し', label: 'お試し' },
    { value: '初伝', label: '初伝' },
    { value: '中伝', label: '中伝' },
    { value: '奥伝', label: '奥伝' },
    { value: '皆伝', label: '皆伝' },
    { value: '極伝', label: '極伝' },
  ];

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

      {/* 必要条件の設定 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            必要ジェム数
          </label>
          <input
            type="number"
            value={formData.gemCost}
            onChange={(e) => setFormData(prev => ({ ...prev, gemCost: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            required
            min="0"
          />
        </div>

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
          <select
            value={formData.rankRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, rankRequired: e.target.value }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          >
            {rankOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 制限時間と合格点の設定 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
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
          <label 
            className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            合格点
          </label>
          <input
            type="number"
            value={formData.passingScore}
            onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            min="0"
            max="100"
          />
        </div>

        <div>
          <label 
            className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            優秀合格点
          </label>
          <input
            type="number"
            value={formData.excellentScore}
            onChange={(e) => setFormData(prev => ({ ...prev, excellentScore: parseInt(e.target.value) }))}
            className={`w-full rounded-lg p-3 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            min="0"
            max="100"
          />
        </div>
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
