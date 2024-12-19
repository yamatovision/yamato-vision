'use client';

import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
}

interface BadgeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function BadgeSelectModal({ isOpen, onClose, userId }: BadgeSelectModalProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBadges();
    }
  }, [isOpen]);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/badges');
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeGrant = async (badgeId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ badgeId }),
      });

      if (!response.ok) throw new Error('Failed to grant badge');

      alert('バッジを付与しました');
      onClose();
    } catch (error) {
      console.error('Error granting badge:', error);
      alert('バッジの付与に失敗しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#2C3E50] mb-4">
          バッジを選択
        </h3>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A90E2]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleBadgeGrant(badge.id)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={badge.iconUrl}
                    alt={badge.title}
                    className="w-12 h-12"
                  />
                  <div>
                    <h4 className="font-medium text-[#2C3E50]">{badge.title}</h4>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-[#2C3E50] hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
