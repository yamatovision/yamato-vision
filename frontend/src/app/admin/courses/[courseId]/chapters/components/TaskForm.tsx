'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { ChapterTask } from '@/types/chapter';  // Task から ChapterTask に変更

interface TaskFormProps {
  initialData?: ChapterTask;
  onSubmit: (taskData: ChapterTask) => void;
  disabled?: boolean;
}

export function TaskForm({ initialData, onSubmit, disabled = false }: TaskFormProps) {
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<ChapterTask>({
    title: initialData?.title || '',
    materials: initialData?.materials || '',
    task: initialData?.task || '',
    evaluationCriteria: initialData?.evaluationCriteria || '',
    maxPoints: 100,
  });

  useEffect(() => {
    console.log('TaskForm initialized with:', {
      initialData,
      extractedData: {
        materials: initialData?.materials || '',
        task: initialData?.task || '',
        evaluationCriteria: initialData?.evaluationCriteria || ''
      }
    });
  }, [initialData]);

  const handleChange = (field: keyof Omit<ChapterTask, 'maxPoints'>, value: string) => {
    console.log('TaskForm - HandleChange:', {
      field,
      value,
      currentFormData: formData
    });

    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);

    // systemMessage 生成を削除し、純粋なフォームデータのみを送信
    onSubmit({
      ...newFormData,
      maxPoints: 100,
    });
  };

  return (
    <div className="space-y-6">
      {/* 教材内容 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          教材内容
        </label>
        <textarea
          value={formData.materials}
          onChange={(e) => handleChange('materials', e.target.value)}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="講座の内容を入力してください"
          disabled={disabled}
        />
      </div>

      {/* 課題内容 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          課題内容
        </label>
        <textarea
          value={formData.task}
          onChange={(e) => handleChange('task', e.target.value)}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="課題の内容を入力してください"
          disabled={disabled}
        />
      </div>

      {/* 評価基準 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          評価基準
        </label>
        <textarea
          value={formData.evaluationCriteria}
          onChange={(e) => handleChange('evaluationCriteria', e.target.value)}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="評価基準を入力してください"
          disabled={disabled}
        />
      </div>
    </div>
  );
}