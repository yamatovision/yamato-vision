'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Post } from '@/types/forum';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-4 ${
      theme === 'dark'
        ? 'bg-gray-800 hover:bg-gray-700'
        : 'bg-white border border-[#DBEAFE] hover:bg-[#F8FAFC]'
    } transition-colors`}>
      <Link href={`/forum/posts/${post.id}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>
              {post.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>💬 {post.commentsCount}</span>
              <span>❤️ {post.likes}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                by
              </span>
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                {post.authorName}
              </span>
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
        </div>
      </Link>
    </div>
  );
};
