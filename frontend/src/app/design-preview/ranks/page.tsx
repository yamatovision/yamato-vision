'use client';

import { useTheme } from '@/contexts/theme';
import { getRankStyle } from '@/lib/utils/rankStyles';

const RANKS = ['お試し', '初伝', '中伝', '奥伝', '皆伝', '管理者'];

const PreviewCard = ({ rank }: { rank: string }) => {
  const { theme } = useTheme();
  const style = getRankStyle(rank, theme);

  const mockUserData = {
    nickname: 'サンプルユーザー',
    rank: rank,
    level: 42,
    experience: 420,
    gems: 1000,
    badges: Array(4).fill({ id: '1', title: 'バッジ', iconUrl: 'https://placehold.jp/30x30.png' }),
    weeklyTokens: 5000,
    unprocessedTokens: 8500,
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{rank}</h2>
      <div className={`${style.container} rounded-2xl p-6`}>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between">
            <div className="flex space-x-6">
              {/* アバターと階級 */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden ${style.avatarBorder}`}>
                  <img 
                    src="https://placehold.jp/150x150.png"
                    alt="アバター" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className={`absolute -bottom-2 -right-2 ${style.rankBadge} px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1`}>
                  <span className="text-xs">階級</span>
                  <span>{rank}</span>
                </div>
              </div>

              {/* ユーザー情報 */}
              <div>
                <h1 className={`text-2xl font-bold mb-2 ${style.nameText}`}>
                  {mockUserData.nickname}
                </h1>
                
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={style.levelText}>Lv.{mockUserData.level}</span>
                    <span className={style.expText}>
                      次のレベルまで: {1000 - mockUserData.experience % 1000} EXP
                    </span>
                  </div>
                  <div className={`w-48 h-2 ${style.expBackground} rounded-full`}>
                    <div 
                      className={`h-full ${style.expBar} rounded-full transition-all duration-300`}
                      style={{width: `${(mockUserData.experience % 1000) / 10}%`}}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">💎</span>
                  <span className={style.gemText}>{mockUserData.gems}</span>
                </div>
              </div>
            </div>

            {/* バッジコレクション */}
            <div className="grid grid-cols-4 gap-2">
              {mockUserData.badges.map((_, index) => (
                <div 
                  key={index}
                  className={`w-12 h-12 ${style.badgeBg} rounded-full flex items-center justify-center`}
                >
                  <img src="https://placehold.jp/30x30.png" alt="バッジ" className="w-8 h-8" />
                </div>
              ))}
            </div>
          </div>

          {/* トークン情報 */}
          <div className={`${style.tokenBg} border ${style.tokenBorder} rounded-lg p-4`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className={`text-sm font-semibold ${style.tokenText}`}>週間トークン</h3>
                <p className="text-lg font-bold">{mockUserData.weeklyTokens.toLocaleString()}</p>
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${style.tokenText}`}>経験値予定</h3>
                <p className="text-lg font-bold">+{Math.floor(mockUserData.unprocessedTokens / 10000)} EXP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RankPreview() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">階級スタイルプレビュー</h1>
      {RANKS.map((rank) => (
        <PreviewCard key={rank} rank={rank} />
      ))}
    </div>
  );
}
