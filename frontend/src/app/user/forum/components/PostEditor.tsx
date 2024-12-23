'use client';

import React, { useState } from 'react';
import { PostCreateInput } from '@/types/forum';

interface PostEditorProps {
  onSubmit: (post: PostCreateInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<PostCreateInput>;
}

export function PostEditor({
  onSubmit,
  onCancel,
  initialData = {},
}: PostEditorProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトル入力 */}
        <div>
          <label className="block text-gray-300 mb-2">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="投稿のタイトルを入力..."
            required
          />
        </div>

        {/* 本文入力 */}
        <div>
          <label className="block text-gray-300 mb-2">本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="投稿内容を入力..."
            required
          />
        </div>

        {/* タグ入力 */}
        <div>
          <label className="block text-gray-300 mb-2">タグ</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タグを入力..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-300 hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 投稿プレビュー */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-gray-300 mb-2">プレビュー</h3>
          <h4 className="text-xl font-bold mb-2">{title || 'タイトル'}</h4>
          <p className="text-gray-300 whitespace-pre-wrap mb-4">
            {content || '本文'}
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className={`px-6 py-2 rounded-lg text-white ${
              isSubmitting || !title.trim() || !content.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}