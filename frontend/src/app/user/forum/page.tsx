'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/theme';
import { Post, PostCreateInput } from '@/types/forum';
import { PostCard } from './components/PostCard';
import { PostEditor } from './components/PostEditor';

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'AIプロンプトエンジニアリングのベストプラクティス',
    content: 'プロンプトエンジニアリングの効果的な手法について...',
    authorId: '1',
    authorName: 'AI Master',
    authorRank: '極伝',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 42,
    commentsCount: 15,
    tags: ['AI', 'プロンプト', 'テクニック'],
    isVisible: true
  },
  {
    id: '2',
    title: 'AIモデルの最適化手法について',
    content: '大規模言語モデルの最適化方法を解説...',
    authorId: '2',
    authorName: 'Tech Guru',
    authorRank: '皆伝',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 38,
    commentsCount: 23,
    tags: ['AI', '最適化', 'パフォーマンス'],
    isVisible: true
  }
];

// 残りのコードは同じ
export default function ForumPage() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);

  const handleCreatePost = async (post: PostCreateInput) => {
    try {
      // ここでAPIを呼び出して投稿を作成
      console.log('Create post:', post);
      // 成功したら投稿一覧を更新し、エディタを閉じる
      setIsPostEditorOpen(false);
      // 実際のAPIができたら、ここで投稿一覧を再取得
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'
    }`}>
      {/* ヘッダー部分 */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          コミュニティフォーラム
        </h1>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsPostEditorOpen(true)}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-[#3B82F6] hover:bg-[#2563EB]'
            } text-white`}
          >
            新規投稿
          </button>
          <div className="relative">
            <input
              type="search"
              placeholder="投稿を検索..."
              className={`rounded-lg px-4 py-2 w-64 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-[#DBEAFE] text-[#1E40AF]'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* タグフィルター */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from(new Set(mockPosts.flatMap(post => post.tags))).map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTag === tag
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#3B82F6] text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white border border-[#DBEAFE] text-[#3B82F6] hover:bg-[#DBEAFE]'
            }`}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 投稿一覧 */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700'
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            前へ
          </button>
          <button className={`px-4 py-2 text-white rounded-lg ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-[#3B82F6]'
          }`}>
            1
          </button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700'
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            2
          </button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700'
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            3
          </button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700'
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            次へ
          </button>
        </div>
      </div>

      {/* 新規投稿モーダル */}
      {isPostEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl rounded-lg ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
              }`}>
                新規投稿
              </h2>
              <PostEditor
                onSubmit={handleCreatePost}
                onCancel={() => setIsPostEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}