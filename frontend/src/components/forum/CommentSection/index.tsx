'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Comment } from '@/types/forum';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onSubmitComment: (content: string) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onSubmitComment,
}) => {
  const { theme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* コメント入力フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={`w-full rounded-lg px-4 py-2 min-h-[100px] ${
            theme === 'dark'
              ? 'bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
              : 'bg-[#F8FAFC] border border-[#DBEAFE] text-[#1E40AF] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none'
          }`}
          placeholder="コメントを入力..."
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className={`px-6 py-2 rounded-lg text-white ${
              isSubmitting || !newComment.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB]'
            }`}
          >
            {isSubmitting ? '送信中...' : 'コメントする'}
          </button>
        </div>
      </form>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-lg p-4 space-y-2 ${
              theme === 'dark'
                ? 'bg-gray-700'
                : 'bg-[#F8FAFC] border border-[#DBEAFE]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                  {comment.authorName}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  theme === 'dark'
                    ? 'bg-purple-900 text-purple-300'
                    : 'bg-[#DBEAFE] text-[#3B82F6]'
                }`}>
                  {comment.authorRank}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {comment.content}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <button className={`flex items-center space-x-1 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-blue-400'
                  : 'text-gray-500 hover:text-[#3B82F6]'
              }`}>
                <span>👍</span>
                <span>{comment.likes}</span>
              </button>
              <button className={
                theme === 'dark'
                  ? 'text-gray-400 hover:text-blue-400'
                  : 'text-gray-500 hover:text-[#3B82F6]'
              }>
                返信する
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
