'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Post, Comment } from '@/types/forum';
import { CommentSection } from '@/components/forum/CommentSection';


// モックデータ
const mockPost: Post = {
  id: '1',
  title: 'AIプロンプトエンジニアリングのベストプラクティス',
  content: `プロンプトエンジニアリングは、AI開発において非常に重要な技術です。
  
効果的なプロンプトを作成するためには、以下のポイントに注意が必要です：

1. 明確な指示
2. コンテキストの提供
3. 制約条件の設定
4. 出力フォーマットの指定

これらの要素を適切に組み合わせることで、より精度の高い結果を得ることができます。`,
  authorId: '1',
  authorName: 'AI Master',
  authorRank: '極伝',
  createdAt: new Date(),
  updatedAt: new Date(),
  likes: 42,
  commentsCount: 2,
  tags: ['AI', 'プロンプト', 'テクニック']
};

const mockComments: Comment[] = [
  {
    id: '1',
    content: '非常に参考になりました！特に制約条件の設定について、もう少し詳しく知りたいです。',
    authorId: '2',
    authorName: 'Tech Learner',
    authorRank: '中伝',
    createdAt: new Date(),
    likes: 5
  },
  {
    id: '2',
    content: '実践的な例があるともっと分かりやすいと思います。具体的なユースケースを共有していただけないでしょうか？',
    authorId: '3',
    authorName: 'AI Explorer',
    authorRank: '初伝',
    createdAt: new Date(),
    likes: 3
  }
];
export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { theme } = useTheme();
  const [post, setPost] = useState<Post>(mockPost);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [isLiked, setIsLiked] = useState(false);
  const resolvedParams = use(params); // paramsをReact.use()で解決

  const handleLike = () => {
    setIsLiked(!isLiked);
    setPost(prev => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleSubmitComment = async (content: string) => {
    const newComment: Comment = {
      id: String(comments.length + 1),
      content,
      authorId: 'current-user',
      authorName: 'Current User',
      authorRank: '初伝',
      createdAt: new Date(),
      likes: 0
    };
    setComments([...comments, newComment]);
    setPost(prev => ({
      ...prev,
      commentsCount: prev.commentsCount + 1
    }));
  };


  return (
    <div className={`max-w-4xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      {/* 戻るリンク */}
      <Link
        href="/forum"
        className={theme === 'dark' ? 'text-blue-400 hover:text-blue-300 mb-6 inline-block' : 'text-[#3B82F6] hover:text-[#2563EB] mb-6 inline-block'}
      >
        ← フォーラムに戻る
      </Link>

      {/* 投稿本文 */}
      <article className={`rounded-lg p-6 mb-8 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-[#DBEAFE]'
      }`}>
        <header className="mb-6">
          <h1 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>
            {post.title}
          </h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>by</span>
                <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>{post.authorName}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  theme === 'dark'
                    ? 'bg-purple-900 text-purple-300'
                    : 'bg-[#DBEAFE] text-[#3B82F6]'
                }`}>
                  {post.authorRank}
                </span>
              </div>
              <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full text-xs ${
                  theme === 'dark'
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-[#DBEAFE] text-[#3B82F6]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-invert max-w-none mb-6">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {post.content}
          </p>
        </div>

        <footer className={`flex items-center justify-between pt-4 ${
          theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-[#DBEAFE]'
        }`}>
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked 
                  ? 'text-pink-500' 
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-pink-500'
                    : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{post.likes}</span>
            </button>
            <div className={`flex items-center space-x-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>💬</span>
              <span>{post.commentsCount}</span>
            </div>
          </div>
          <button className={theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-[#3B82F6]'}>
            共有する
          </button>
        </footer>
      </article>

      {/* コメントセクション */}
      <div className={`rounded-lg p-6 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-[#DBEAFE]'
      }`}>
        <h2 className={`text-xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          コメント ({comments.length})
        </h2>
        <CommentSection
          comments={comments}
          postId={resolvedParams.postId}
          onSubmitComment={handleSubmitComment}
        />
      </div>
    </div>
  );
}