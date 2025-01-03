'use client';

import { useState } from 'react';

interface TaskFormData {
  title: string;
  description: string;
  materials: string;
  task: string;
  evaluationCriteria: string;
  maxPoints: number;
}

interface TaskFormProps {
  initialData?: {
    title?: string;
    description?: string;
    maxPoints?: number;
  };
  onSubmit: (taskData: CreateTaskDTO) => void;  // Promiseを削除
}

interface CreateTaskDTO {
  title: string;
  description: string;
  systemMessage: string;
  maxPoints: number;
}

export function TaskForm({ initialData, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    materials: '',
    task: '',
    evaluationCriteria: '',
    maxPoints: initialData?.maxPoints || 100
  });

  // フォームの値が変更されるたびにonSubmitを呼び出し
  const handleChange = (field: keyof TaskFormData, value: string | number) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);

    // システムメッセージを構築
    const systemMessage = `<materials>
${newFormData.materials}
</materials>
<task>
${newFormData.task}
</task>
<evaluation_criteria>
${newFormData.evaluationCriteria}
</evaluation_criteria>`;

    // 親コンポーネントに変更を通知
    onSubmit({
      title: newFormData.title,
      description: newFormData.description,
      systemMessage: systemMessage,
      maxPoints: newFormData.maxPoints
    });
  };

  return (
    <div className="space-y-6">
      {/* 教材内容 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          教材内容 *
        </label>
        <textarea
          value={formData.materials}
          onChange={(e) => handleChange('materials', e.target.value)}
          className="w-full h-32 rounded-lg p-3"
          placeholder="講座の内容を入力してください"
          required
        />
      </div>

      {/* 課題内容 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          課題内容 *
        </label>
        <textarea
          value={formData.task}
          onChange={(e) => handleChange('task', e.target.value)}
          className="w-full h-32 rounded-lg p-3"
          placeholder="課題の内容を入力してください"
          required
        />
      </div>

      {/* 評価基準 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          評価基準 *
        </label>
        <textarea
          value={formData.evaluationCriteria}
          onChange={(e) => handleChange('evaluationCriteria', e.target.value)}
          className="w-full h-32 rounded-lg p-3"
          placeholder="評価基準を入力してください"
          required
        />
      </div>
    </div>
  );
}