'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { Task } from '@/types/course';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (taskData: Task) => void;
  disabled?: boolean;
}

export function TaskForm({ initialData, onSubmit, disabled = false }: TaskFormProps) {
  const { theme } = useTheme();
  
  // システムメッセージからコンテンツを抽出する関数
  const extractContent = (systemMessage: string | undefined, tag: string): string => {
    if (!systemMessage) return '';
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
    const match = systemMessage.match(regex);
    return match ? match[1].trim() : '';
  };

  // 初期値の設定を修正
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    description: initialData?.description || '',
    materials: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'materials') : '',
    task: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'task') : '',
    evaluationCriteria: initialData?.systemMessage ? extractContent(initialData.systemMessage, 'evaluation_criteria') : '',
    maxPoints: initialData?.maxPoints || 100,
    systemMessage: initialData?.systemMessage || '',
    referenceText: initialData?.referenceText || '',
  });

  useEffect(() => {
    // デバッグ用ログ
    console.log('TaskForm initialized with:', {
      initialData,
      extractedData: {
        materials: extractContent(initialData?.systemMessage, 'materials'),
        task: extractContent(initialData?.systemMessage, 'task'),
        evaluationCriteria: extractContent(initialData?.systemMessage, 'evaluation_criteria')
      }
    });
  }, [initialData]);

  const handleChange = (field: keyof Omit<Task, 'id'>, value: string | number) => {
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
      systemMessage,
      referenceText: newFormData.referenceText,
    } as Task);
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

      {/* 参考テキスト */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          参考テキスト
        </label>
        <textarea
          value={formData.referenceText}
          onChange={(e) => handleChange('referenceText', e.target.value)}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="参考テキストを入力してください"
          disabled={disabled}
        />
      </div>
    </div>
  );
}