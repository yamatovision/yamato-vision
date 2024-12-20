'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme';
import { CommentSection } from '../components/CommentSection';
import { Post } from '../types';

// この部分は後でAPIから取得する実装に置き換え
const mockPost: Post = {
  id: '1',
  title: 'AIプロンプトエンジニアリングのベストプラクティス',
  content: 'プロンプトエンジニアリングの効果的な手法について詳しく解説します。\n\n1. 明確な指示を与える\n2. コンテキストを適切に設定する\n3. 制約条件を明示する\n\nこれらの要素を適切に組み合わせることで、より精度の高い結果を得ることができます。',
  authorId: '1',
  authorName: 'AI Master',
  authorRank: '極伝',
  createdAt: new Date(),
  updatedAt: new Date(),
  likes: 42,
  commentsCount: 15,
  tags: ['AI', 'プロンプト', 'テクニック'],
  isVisible: true
};

const mockComments = [
  {
    id: '1',
    postId: '1',
    authorId: '2',
    authorName: 'Tech Guru',
    authorRank: '皆伝',
    content: '非常に参考になりました！',
    likes: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    isVisible: true
  }
];

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  const { theme } = useTheme();

  const handleLike = () => {
    console.log('Like post:', params.postId);
  };

  const handleSubmitComment = async (content: string) => {
    console.log('Submit comment:', content);
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'
    }`}>
      {/* 投稿本文 */}
      <div className={`rounded-lg p-6 mb-8 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-[#DBEAFE]'
      }`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>
            {mockPost.title}
          </h1>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                {mockPost.authorName}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                theme === 'dark'
                  ? 'bg-purple-900 text-purple-300'
                  : 'bg-[#DBEAFE] text-[#3B82F6]'
              }`}>
                {mockPost.authorRank}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
              {new Date(mockPost.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {mockPost.tags?.map(tag => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full text-xs ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-[#DBEAFE] text-[#3B82F6]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className={`whitespace-pre-wrap mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {mockPost.content}
        </p>
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-blue-400'
                : 'text-gray-500 hover:text-[#3B82F6]'
            }`}
          >
            <span>👍</span>
            <span>{mockPost.likes}</span>
          </button>
        </div>
      </div>

      {/* コメントセクション */}
      <div id="comments">
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          コメント ({mockComments.length})
        </h2>
        <CommentSection
          comments={mockComments}
          postId={params.postId}
          onSubmitComment={handleSubmitComment}
        />
      </div>
    </div>
  );
}