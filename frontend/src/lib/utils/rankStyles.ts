// src/lib/utils/rankStyles.ts
interface RankStyle {
  container: string;
  avatarBorder: string;
  rankBadge: string;
  nameText: string;
  levelText: string;
  expText: string;
  expBackground: string;
  expBar: string;
  gemText: string;
  linkText: string;
  badgeBg: string;
  tokenText: string;
  tokenBg: string;
  tokenBorder: string;
}

export const getRankStyle = (rank: string, theme: 'light' | 'dark'): RankStyle => {
  // ベーススタイル（ダーク/ライトモード）
  const baseStyles = theme === 'dark' ? {
    // ダークモード
    container: 'bg-gradient-to-r from-blue-900 to-purple-900',
    nameText: 'text-white',
    levelText: 'text-gray-300',
    expText: 'text-gray-400',
    expBackground: 'bg-gray-700',
    gemText: 'text-white',
    linkText: 'text-blue-400',
    badgeBg: 'bg-gray-800/50',
    tokenText: 'text-gray-300',
    tokenBg: 'bg-gray-800/30',
    tokenBorder: 'border-gray-700',
    expBar: 'bg-blue-500',
  } : {
    // ライトモード
    container: 'bg-white shadow-md',
    nameText: 'text-gray-800',
    levelText: 'text-blue-600',
    expText: 'text-blue-500',
    expBackground: 'bg-blue-50',
    gemText: 'text-gray-800',
    linkText: 'text-blue-500',
    badgeBg: 'bg-blue-50',
    tokenText: 'text-blue-600',
    tokenBg: 'bg-blue-50/50',
    tokenBorder: 'border-blue-100',
    expBar: 'bg-blue-400',
  
  };

  // 階級別のスタイル（よりクリアな色使いに）
  let rankSpecificStyles = {
    avatarBorder: theme === 'light' ? 'border-4 border-sky-200' : 'border-4 border-gray-300',
    rankBadge: theme === 'light' ? 'bg-sky-200 text-sky-700' : 'bg-gray-500 text-white',
  };

  // 階級別の色設定（ライトモード用に明るく爽やかな色調に）
  if (theme === 'light') {
    switch (rank) {
      case '管理者':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-sky-400',
          rankBadge: 'bg-gradient-to-r from-sky-500 to-sky-400 text-white',
        };
        break;
      case '皆伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-blue-400',
          rankBadge: 'bg-gradient-to-r from-blue-400 to-sky-400 text-white',
        };
        break;
      case '奥伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-sky-300',
          rankBadge: 'bg-gradient-to-r from-sky-400 to-sky-300 text-white',
        };
        break;
      case '中伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-blue-300',
          rankBadge: 'bg-gradient-to-r from-blue-300 to-sky-300 text-white',
        };
        break;
      case '初伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-sky-200',
          rankBadge: 'bg-gradient-to-r from-sky-300 to-sky-200 text-sky-700',
        };
        break;
      default: // お試し
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-gray-200',
          rankBadge: 'bg-gray-200 text-gray-600',
        };
        break;
    }
  } else {
    // ダークモードの階級別スタイル（既存のまま）
    switch (rank) {
      case '管理者':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-purple-500',
          rankBadge: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white',
        };
        break;
      case '皆伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-blue-400',
          rankBadge: 'bg-gradient-to-r from-blue-500 to-blue-400 text-white',
        };
        break;
      case '奥伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-cyan-400',
          rankBadge: 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white',
        };
        break;
      case '中伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-teal-400',
          rankBadge: 'bg-gradient-to-r from-teal-500 to-teal-400 text-white',
        };
        break;
      case '初伝':
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-emerald-400',
          rankBadge: 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white',
        };
        break;
      default: // お試し
        rankSpecificStyles = {
          avatarBorder: 'border-4 border-gray-300',
          rankBadge: 'bg-gray-500 text-white',
        };
        break;
    }
  }

  return {
    ...baseStyles,
    ...rankSpecificStyles,
  };
};

