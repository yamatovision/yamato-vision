import { useState, useEffect } from 'react';
import { Badge } from '@/types/admin.types';
import { useToast } from '@/hooks/useToast';

interface BadgeSelectorProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BadgeSelector({ userId, onClose, onSuccess }: BadgeSelectorProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchAvailableBadges();
  }, []);

  const fetchAvailableBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.data);
    } catch (error) {
      showToast('バッジの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeGrant = async () => {
    if (!selectedBadgeId) {
      showToast('バッジを選択してください', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ badgeId: selectedBadgeId })
      });

      if (!response.ok) {
        throw new Error('Failed to grant badge');
      }

      showToast('バッジを付与しました', 'success');
      onSuccess();
    } catch (error) {
      showToast('バッジの付与に失敗しました', 'error');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          バッジを選択
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadgeId(badge.id)}
              className={`cursor-pointer p-2 rounded-lg border-2 ${
                selectedBadgeId === badge.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                <img
                  src={badge.iconUrl}
                  alt={badge.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-center font-medium text-gray-700">
                {badge.title}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleBadgeGrant}
            disabled={!selectedBadgeId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            付与する
          </button>
        </div>
      </div>
    </div>
  );
}
