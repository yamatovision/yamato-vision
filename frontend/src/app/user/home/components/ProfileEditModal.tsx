'use client';


import { useState, useRef } from 'react';
import { useTheme } from '@/contexts/theme';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';

interface SNSLink {
  type: string;
  value: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    nickname: string;
    avatarUrl: string;
    message: string;
    snsLinks: Record<string, string>;
  };
  onSave: (data: any) => Promise<void>;
  onAvatarUpdate: (url: string) => Promise<void>;
}

export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  profileData, 
  onSave,
  onAvatarUpdate 
}: ProfileEditModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState(profileData);
  const [loading, setLoading] = useState(false);
  const [snsLinks, setSnsLinks] = useState<SNSLink[]>(
    Object.entries(profileData.snsLinks || {}).map(([type, value]) => ({ type, value }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      // TODO: 実際のアップロード処理を実装
      // 仮のURL処理
      const imageUrl = URL.createObjectURL(file);
      await onAvatarUpdate(imageUrl);
      setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSNS = () => {
    setSnsLinks([...snsLinks, { type: '', value: '' }]);
  };

  const handleRemoveSNS = (index: number) => {
    setSnsLinks(snsLinks.filter((_, i) => i !== index));
  };

  const handleSNSChange = (index: number, field: 'type' | 'value', value: string) => {
    const newLinks = [...snsLinks];
    newLinks[index][field] = value;
    setSnsLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const snsLinksObject = snsLinks.reduce((acc, { type, value }) => {
        if (type && value) {
          acc[type] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      await onSave({
        ...formData,
        snsLinks: snsLinksObject
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>プロフィール編集</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* アバター編集 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group relative"
              >
                <img 
                  src={formData.avatarUrl || "https://placehold.jp/150x150.png"} 
                  alt="アバター" 
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-70" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlusIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* ニックネーム */}
          <div>
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            } mb-1`}>
              ニックネーム
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className={`w-full px-3 py-2 rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* メッセージ */}
          <div>
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            } mb-1`}>
              メッセージ
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full px-3 py-2 rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
            />
          </div>

          {/* SNSリンク */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                SNSリンク
              </label>
              <button
                type="button"
                onClick={handleAddSNS}
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                追加
              </button>
            </div>
            <div className="space-y-2">
              {snsLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="SNS名"
                    value={link.type}
                    onChange={(e) => handleSNSChange(index, 'type', e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.value}
                    onChange={(e) => handleSNSChange(index, 'value', e.target.value)}
                    className={`flex-2 px-3 py-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                <button
                    type="button"
                    onClick={() => handleRemoveSNS(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
