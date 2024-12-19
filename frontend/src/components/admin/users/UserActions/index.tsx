interface UserActionsProps {
  userId: string;
  onClose: () => void;
}

export function UserActions({ userId, onClose }: UserActionsProps) {
  const handleGemGrant = async (amount: number) => {
    // ジェム付与処理
    console.log(`Grant ${amount} gems to user ${userId}`);
    onClose();
  };

  const handleBadgeGrant = async (badgeId: string) => {
    // バッジ付与処理
    console.log(`Grant badge ${badgeId} to user ${userId}`);
    onClose();
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
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
                placeholder="付与するジェム数"
              />
              <button
                onClick={() => handleGemGrant(100)}
                className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
              >
                付与
              </button>
            </div>
          </div>

          {/* バッジ付与 */}
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              バッジ付与
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              onChange={(e) => handleBadgeGrant(e.target.value)}
            >
              <option value="">バッジを選択...</option>
              <option value="beginner">初心者バッジ</option>
              <option value="expert">エキスパートバッジ</option>
              {/* 他のバッジオプション */}
            </select>
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
    </div>
  );
}
