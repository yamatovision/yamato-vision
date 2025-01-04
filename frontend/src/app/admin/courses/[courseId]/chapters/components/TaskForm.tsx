'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';

interface TaskFormProps {
  initialData?: {
    description?: string;
    referenceText?: string;
    systemMessage?: string;
    maxPoints?: number;
  };
  onSubmit: (taskData: {
    description: string;
    materials: string;
    task: string;
    evaluationCriteria: string;
    maxPoints: number;
    systemMessage: string;
  }) => void;
  disabled?: boolean;
}

export function TaskForm({ initialData, onSubmit, disabled = false }: TaskFormProps) {
  const { theme } = useTheme();

  // システムメッセージからコンテンツを抽出する関数
  const extractContent = (systemMessage: string, tag: string): string => {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
    const match = systemMessage?.match(regex);
    return match ? match[1].trim() : '';
  };

  const [formData, setFormData] = useState({
    materials: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'materials') : '',
    task: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'task') : '',
    evaluationCriteria: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'evaluation_criteria') : '',
    description: initialData?.description || '',
    maxPoints: initialData?.maxPoints || 100
  });

  useEffect(() => {
    console.log('TaskForm - FormData initialized:', formData);
  }, []);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
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

    const systemMessage = `<materials>
${newFormData.materials}
</materials>
<task>
${newFormData.task}
</task>
<evaluation_criteria>
${newFormData.evaluationCriteria}
</evaluation_criteria>`;

    onSubmit({
      ...newFormData,
      systemMessage
    });
  };


  return (
    <div className="space-y-6">
      {/* 教材内容 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          教材内容 *
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
          required
        />
      </div>

      {/* 課題内容 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          課題内容 *
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
          required
        />
      </div>

      {/* 評価基準 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          評価基準 *
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
          required
        />
      </div>
    </div>
  );
}