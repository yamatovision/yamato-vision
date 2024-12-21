'use client';

import { useState } from 'react';
import { Badge } from '@/types/admin';

interface UserActionsProps {
  userId: string;
  currentStatus: string;
  onUpdate: () => void;
}

export function UserActions({ userId, currentStatus, onUpdate }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gems' | 'badges' | 'penalty'>('gems');
  const [gemAmount, setGemAmount] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // バッジ一覧の取得
  const fetchBadges = async () => {
    if (activeTab === 'badges' && badges.length === 0) {
      try {
        const response = await fetch('/api/badges');
        const data = await response.json();
        if (data.success) {
          setBadges(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      }
    }
  };

  // モーダルを開く際にバッジ一覧を取得
  const handleOpen = () => {
    setIsOpen(true);
    fetchBadges();
  };

  // ジェム付与処理
  const handleGemGrant = async () => {
    if (gemAmount <= 0) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/admin/users/${userId}/gems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: gemAmount })
      });
      
      if (!response.ok) throw new Error('Failed to grant gems');
      
      onUpdate();
      setIsOpen(false);
      setGemAmount(0);
    } catch (error) {
      console.error('Error granting gems:', error);
    } finally {
      setLoading(false);
    }
  };

  // バッジ付与処理
  const handleBadgeGrant = async () => {
    if (!selectedBadgeId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/admin/users/${userId}/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId: selectedBadgeId })
      });
      
      if (!response.ok) throw new Error('Failed to grant badge');
      
      onUpdate();
      setIsOpen(false);
      setSelectedBadgeId('');
    } catch (error) {
      console.error('Error granting badge:', error);
    } finally {
      setLoading(false);
    }
  };

  // ペナルティ状態の切り替え
  const handlePenaltyToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/admin/users/${userId}/penalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPenalty: currentStatus !== 'PENALTY' })
      });
      
      if (!response.ok) throw new Error('Failed to toggle penalty');
      
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error toggling penalty:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-[#4A90E2] hover:text-[#357ABD] font-medium"
      >
        操作
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-[#2C3E50]">ユーザー操作</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('gems')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'gems'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ジェム付与
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'badges'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              バッジ付与
            </button>
            <button
              onClick={() => setActiveTab('penalty')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'penalty'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ペナルティ
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'gems' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付与するジェム数
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={gemAmount}
                    onChange={(e) => setGemAmount(Number(e.target.value))}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ジェム数を入力"
                    min="0"
                  />
                  <button
                    onClick={handleGemGrant}
                    disabled={loading || gemAmount <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    付与
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className={`p-2 border rounded-lg cursor-pointer ${
                      selectedBadgeId === badge.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img
                      src={badge.iconUrl}
                      alt={badge.title}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    <div className="mt-1 text-xs text-center font-medium text-gray-700">
                      {badge.title}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBadgeGrant}
                disabled={loading || !selectedBadgeId}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                バッジを付与
              </button>
            </div>
          )}

          {activeTab === 'penalty' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {currentStatus === 'PENALTY'
                  ? 'ペナルティを解除しますか？'
                  : 'ペナルティを設定しますか？'}
              </p>
              <button
                onClick={handlePenaltyToggle}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md ${
                  currentStatus === 'PENALTY'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white disabled:opacity-50`}
              >
                {currentStatus === 'PENALTY' ? 'ペナルティを解除' : 'ペナルティを設定'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
