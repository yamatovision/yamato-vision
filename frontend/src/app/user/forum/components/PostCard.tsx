'use client';
import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/theme';
import { Post } from '@/types/forum';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-lg p-6 ${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE]'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <Link 
            href={`/user/forum/posts/${post.id}`}
            className={`text-xl font-bold hover:underline ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}
          >
            {post.title}
          </Link>
          <div className="flex items-center space-x-2">
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
            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <p className={`mb-4 line-clamp-3 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {post.content}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map(tag => (
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
      <div className="flex items-center space-x-6 text-sm">
        <button className={`flex items-center space-x-1 ${
          theme === 'dark'
            ? 'text-gray-400 hover:text-blue-400'
            : 'text-gray-500 hover:text-[#3B82F6]'
        }`}>
          <span>👍</span>
          <span>{post.likes}</span>
        </button>
        <Link
          href={`/user/forum/posts/${post.id}#comments`}
          className={`flex items-center space-x-1 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-blue-400'
              : 'text-gray-500 hover:text-[#3B82F6]'
          }`}
        >
          <span>💬</span>
          <span>{post.commentsCount}</span>
        </Link>
      </div>
    </div>
  );
}