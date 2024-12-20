'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BadgeFormProps {
  badgeId: string | null;
}

interface Condition {
  type: 'achievement' | 'level' | 'course' | 'likes';
  value: number;
  description: string;
}

interface BadgeFormData {
  name: string;
  description: string;
  iconUrl: string;
  conditions: Condition[];
  isActive: boolean;
}

export function BadgeForm({ badgeId }: BadgeFormProps) {
  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    iconUrl: '',
    conditions: [{ type: 'achievement', value: 0, description: '' }],
    isActive: true
  });

  const conditionTypes = [
    { value: 'achievement', label: '達成条件' },
    { value: 'level', label: 'レベル到達' },
    { value: 'course', label: 'コース完了' },
    { value: 'likes', label: 'いいね獲得' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API呼び出し処理
    console.log('Submit form data:', formData);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // 画像アップロード処理
      console.log('Upload file:', e.target.files[0]);
    }
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { type: 'achievement', value: 0, description: '' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...formData.conditions];
    newConditions.splice(index, 1);
    setFormData({ ...formData, conditions: newConditions });
  };

  const updateCondition = (index: number, field: keyof Condition, value: any) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">基本情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-1">
              バッジ名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-1">
              アイコン
            </label>
            <div className="flex items-center space-x-4">
              {formData.iconUrl && (
                <div className="relative h-16 w-16">
                  <Image
                    src={formData.iconUrl}
                    alt="Badge icon"
                    layout="fill"
                    className="rounded-full"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4A90E2] file:text-white hover:file:bg-[#357ABD]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 獲得条件 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#2C3E50]">獲得条件</h3>
          <button
            type="button"
            onClick={addCondition}
            className="px-3 py-1 text-sm bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
          >
            条件を追加
          </button>
        </div>

        <div className="space-y-4">
          {formData.conditions.map((condition, index) => (
            <div key={index} className="flex items-start space-x-4">
              <select
                value={condition.type}
                onChange={(e) => updateCondition(index, 'type', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              >
                {conditionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={condition.value}
                onChange={(e) => updateCondition(index, 'value', parseInt(e.target.value))}
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                placeholder="値"
              />

              <input
                type="text"
                value={condition.description}
                onChange={(e) => updateCondition(index, 'description', e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                placeholder="条件の説明"
              />

              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="px-2 py-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 公開設定 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-[#2C3E50]">公開設定</h3>
            <p className="text-sm text-[#707F8C] mt-1">
              バッジの有効/無効を切り替えます
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only"
            />
            <div className={`relative w-14 h-7 transition-colors duration-200 ease-in-out rounded-full ${
              formData.isActive ? 'bg-[#4CAF50]' : 'bg-gray-200'
            }`}>
              <div className={`absolute left-1 top-1 w-5 h-5 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                formData.isActive ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </div>
          </label>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-[#2C3E50] hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
        >
          保存
        </button>
      </div>
    </form>
  );
}
