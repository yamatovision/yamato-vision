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
}

export const getRankStyle = (rank: string, theme: 'light' | 'dark'): RankStyle => {
  const baseStyles = theme === 'dark' ? {
    nameText: 'text-white',
    levelText: 'text-gray-300',
    expText: 'text-gray-400',
    expBackground: 'bg-gray-700',
    gemText: 'text-white',
    linkText: 'text-blue-400',
  } : {
    nameText: 'text-gray-900',
    levelText: 'text-gray-600',
    expText: 'text-gray-500',
    expBackground: 'bg-gray-200',
    gemText: 'text-gray-900',
    linkText: 'text-blue-600',
  };

  switch (rank) {
    case '管理者':
      return {
        ...baseStyles,
        container: 'bg-gradient-to-r from-red-900 to-orange-900 shadow-2xl',
        avatarBorder: 'border-4 border-red-500 shadow-lg shadow-red-500/50',
        rankBadge: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
        expBar: 'bg-red-500',
        badgeBg: 'bg-red-700',
      };
    case '皆伝':
      return {
        ...baseStyles,
        container: 'bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 shadow-xl animate-gradient',
        avatarBorder: 'border-4 border-yellow-400 shadow-lg shadow-yellow-400/50',
        rankBadge: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black',
        expBar: 'bg-yellow-400',
        badgeBg: 'bg-yellow-700',
      };
    case '奥伝':
      return {
        ...baseStyles,
        container: 'bg-gradient-to-r from-purple-900 to-pink-900 shadow-lg',
        avatarBorder: 'border-4 border-purple-400',
        rankBadge: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
        expBar: 'bg-purple-400',
        badgeBg: 'bg-purple-700',
      };
    case '中伝':
      return {
        ...baseStyles,
        container: 'bg-gradient-to-r from-blue-900 to-purple-900',
        avatarBorder: 'border-4 border-blue-400',
        rankBadge: 'bg-gradient-to-r from-blue-400 to-purple-400 text-white',
        expBar: 'bg-blue-400',
        badgeBg: 'bg-blue-700',
      };
    case '初伝':
      return {
        ...baseStyles,
        container: 'bg-gradient-to-r from-blue-800 to-blue-900',
        avatarBorder: 'border-4 border-blue-300',
        rankBadge: 'bg-gradient-to-r from-blue-300 to-blue-400 text-white',
        expBar: 'bg-blue-300',
        badgeBg: 'bg-blue-600',
      };
    default: // お試し
      return {
        ...baseStyles,
        container: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
        avatarBorder: 'border-4 border-gray-300',
        rankBadge: 'bg-gray-500 text-white',
        expBar: 'bg-gray-400',
        badgeBg: 'bg-gray-500',
      };
  }
};
