'use client';

import { useState } from 'react';
import { LevelMessageList } from './LevelMessageList';
import { LevelMessageForm } from './LevelMessageForm';
import { LevelMessage } from '@/types/levelMessage';

export default function LevelMessagesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<LevelMessage | undefined>(undefined);  // null から undefined に変更

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#2C3E50]">レベルメッセージ管理</h1>
        <button
          onClick={() => {
            setEditingMessage(undefined);  // null から undefined に変更
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新規メッセージ作成
        </button>
      </div>

      <LevelMessageList
        onEdit={(message) => {
          setEditingMessage(message);
          setIsFormOpen(true);
        }}
      />

      {isFormOpen && (
        <LevelMessageForm
          message={editingMessage}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMessage(undefined);  // null から undefined に変更
          }}
        />
      )}
    </div>
  );
}