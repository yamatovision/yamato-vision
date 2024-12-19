'use client';

import { useState } from 'react';
import { BadgeSelectModal } from './BadgeSelectModal';

interface UserActionsProps {
  userId: string;
  onClose: () => void;
}

export function UserActions({ userId, onClose }: UserActionsProps) {
  const [gemAmount, setGemAmount] = useState<number>(0);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isPenalty, setIsPenalty] = useState(false);

  const handleGemGrant = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/gems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: gemAmount }),
      });

      if (!response.ok) throw new Error('Failed to grant gems');
      
      // 成功通知を表示
      alert('ジェムを付与しました');
      onClose();
    } catch (error) {
      console.error('Error granting gems:', error);
      alert('ジェムの付与に失敗しました');
    }
  };

  const handlePenaltyToggle = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/penalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPenalty: !isPenalty }),
      });

      if (!response.ok) throw new Error('Failed to toggle penalty status');

      setIsPenalty(!isPenalty);
      alert(isPenalty ? 'ペナルティを解除しました' : 'ペナルティを設定しました');
    } catch (error) {
      console.error('Error toggling penalty:', error);
      alert('ステータスの変更に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">
          ユーザー操作
        </h3>
        
        <div className="space-y-4">
          {/* ジェム付与 */}
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              ジェム付与
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={gemAmount}
                onChange={(e) => setGemAmount(Number(e.target.value))}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                placeholder="付与するジェム数"
                min="0"
              />
              <button
                onClick={handleGemGrant}
                disabled={gemAmount <= 0}
                className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                付与
              </button>
            </div>
          </div>

          {/* バッジ付与 */}
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              バッジ
            </label>
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="w-full px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
            >
              バッジを付与
            </button>
          </div>

          {/* ペナルティステータス */}
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              ペナルティステータス
            </label>
            <button
              onClick={handlePenaltyToggle}
              className={`w-full px-4 py-2 ${
                isPenalty 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-yellow-500 hover:bg-yellow-600'
              } text-white rounded-md`}
            >
              {isPenalty ? 'ペナルティを解除' : 'ペナルティを設定'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-[#2C3E50] hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>

      <BadgeSelectModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}
