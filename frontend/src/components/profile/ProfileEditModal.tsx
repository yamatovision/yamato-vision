// frontend/src/components/profile/ProfileEditModal.tsx
'use client';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    nickname: string;
    avatar: string;
    message: string;
    snsLinks: {
      type: string;
      value: string;
    }[];
  };
  onSave: (data: any) => Promise<void>;
}

export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  profileData, 
  onSave 
}: ProfileEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">プロフィール編集</h2>
          <button onClick={onClose}>×</button>
        </div>

        {/* アバターアップロード */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto relative">
            <img 
              src={profileData.avatar || "/default-avatar.png"} 
              className="w-full h-full rounded-full object-cover"
              alt="プロフィール画像" 
            />
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full">
              <span className="sr-only">画像を変更</span>
              📷
            </button>
          </div>
        </div>

        {/* ニックネーム */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ニックネーム</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            defaultValue={profileData.nickname}
          />
        </div>

        {/* 一言メッセージ */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">一言メッセージ</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            defaultValue={profileData.message}
          />
        </div>

        {/* SNSリンク */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">SNSリンク</label>
          {profileData.snsLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select className="px-3 py-2 border rounded-md">
                <option value="LINE">LINE</option>
                <option value="Twitter">Twitter</option>
                <option value="TikTok">TikTok</option>
              </select>
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="IDまたはURL"
                defaultValue={link.value}
              />
              <button className="text-red-500">削除</button>
            </div>
          ))}
          <button className="text-blue-500 text-sm">+ SNSを追加</button>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            キャンセル
          </button>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}