import { useState } from 'react';
import { BadgeSelector } from './BadgeSelector';
import { useToast } from '@/hooks/useToast';

interface UserActionsProps {
  userId: string;
  currentStatus: string;
  onClose: () => void;
  onError: (error: string) => void;
}

export function UserActions({ userId, currentStatus, onClose, onError }: UserActionsProps) {
  const [gemAmount, setGemAmount] = useState<number>(0);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleGemGrant = async () => {
    if (gemAmount <= 0) {
      showToast('ジェム数は1以上を指定してください', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/gems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: gemAmount })
      });

      if (!response.ok) {
        throw new Error('Failed to grant gems');
      }

      showToast(`${gemAmount}ジェムを付与しました`, 'success');
      onClose();
    } catch (error) {
      onError('ジェムの付与に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePenaltyToggle = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/penalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isPenalty: currentStatus !== 'PENALTY'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle penalty');
      }

      showToast(
        currentStatus === 'PENALTY'
          ? 'ペナルティを解除しました'
          : 'ペナルティを設定しました',
        'success'
      );
      onClose();
    } catch (error) {
      onError('ペナルティステータスの変更に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ユーザー操作
        </h3>

        <div className="space-y-4">
          {/* ジェム付与セクション */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジェム付与
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={gemAmount}
                onChange={(e) => setGemAmount(Number(e.target.value))}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="付与するジェム数"
                min="0"
                disabled={isSubmitting}
              />
              <button
                onClick={handleGemGrant}
                disabled={isSubmitting || gemAmount <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                付与
              </button>
            </div>
          </div>

          {/* バッジ付与セクション */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バッジ付与
            </label>
            <button
              onClick={() => setShowBadgeSelector(true)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              バッジを選択
            </button>
          </div>

          {/* ペナルティセクション */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ペナルティ設定
            </label>
            <button
              onClick={handlePenaltyToggle}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md ${
                currentStatus === 'PENALTY'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white disabled:opacity-50`}
            >
              {currentStatus === 'PENALTY' ? 'ペナルティを解除' : 'ペナルティを設定'}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>

        {/* バッジセレクターモーダル */}
        {showBadgeSelector && (
          <BadgeSelector
            userId={userId}
            onClose={() => setShowBadgeSelector(false)}
            onSuccess={() => {
              setShowBadgeSelector(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
