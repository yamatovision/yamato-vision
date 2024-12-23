// frontend/src/app/admin/level-messages/LevelMessageList.tsx
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/toast';
import { levelMessageAPI } from '@/lib/api/levelMessages';
import { LevelMessage } from '@/types/levelMessage';

interface Props {
  onEdit: (message: LevelMessage) => void;
}


export function LevelMessageList({ onEdit }: Props) {
  const [messages, setMessages] = useState<LevelMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await levelMessageAPI.getAll();
      if (response.data.success) {
        // 配列であることを保証
        const messageData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        setMessages(messageData);
      }
    } catch (error) {
      showToast('メッセージの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await levelMessageAPI.update(id, { isActive: !currentStatus });
      if (response.data.success) {
        showToast('ステータスを更新しました', 'success');
        fetchMessages();
      }
    } catch (error) {
      showToast('更新に失敗しました', 'error');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">レベル</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メッセージ</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {messages.map((message) => (
            <tr key={message.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">Lv.{message.level}</td>
              <td className="px-6 py-4 text-sm">{message.message}</td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => toggleStatus(message.id, message.isActive)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    message.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isActive ? '有効' : '無効'}
                </button>
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => onEdit(message)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
