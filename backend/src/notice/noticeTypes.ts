// backend/src/notices/noticeTypes.ts
export const USER_RANKS = {
  お試し: 'お試し',
  初伝: '初伝',
  中伝: '中伝',
  奥伝: '奥伝',
  皆伝: '皆伝',
  管理者: '管理者',
} as const;

export const NOTICE_TYPES = {
  INFO: 'info',
  MAINTENANCE: 'maintenance',
  SUCCESS: 'success',
  GROUP_CONSUL: 'group_consul',
  PARTY: 'party',
  STUDY: 'study',
  CAMP: 'camp',
} as const;

export type UserRank = keyof typeof USER_RANKS;
export type NoticeType = typeof NOTICE_TYPES[keyof typeof NOTICE_TYPES];

// UI表示用の設定
export const NOTICE_TYPE_CONFIG = {
  [NOTICE_TYPES.INFO]: {
    label: 'お知らせ',
    bgColor: 'bg-blue-500',
    darkBgColor: 'bg-blue-600',
  },
  [NOTICE_TYPES.MAINTENANCE]: {
    label: 'メンテナンス',
    bgColor: 'bg-yellow-500',
    darkBgColor: 'bg-yellow-600',
  },
  [NOTICE_TYPES.SUCCESS]: {
    label: '完了',
    bgColor: 'bg-green-500',
    darkBgColor: 'bg-green-600',
  },
  [NOTICE_TYPES.GROUP_CONSUL]: {
    label: 'グループコンサル',
    bgColor: 'bg-indigo-500',
    darkBgColor: 'bg-indigo-600',
  },
  [NOTICE_TYPES.PARTY]: {
    label: '食事会',
    bgColor: 'bg-orange-500',
    darkBgColor: 'bg-orange-600',
  },
  [NOTICE_TYPES.STUDY]: {
    label: '勉強会',
    bgColor: 'bg-blue-500',
    darkBgColor: 'bg-blue-600',
  },
  [NOTICE_TYPES.CAMP]: {
    label: '合宿',
    bgColor: 'bg-purple-500',
    darkBgColor: 'bg-purple-600',
  },
} as const;

export interface Notice {
  id: string;
  title: string;
  content: string;
  menuContent?: string;
  startAt: Date;
  endAt: Date;
  type: NoticeType;
  isActive: boolean;
  excludedRanks: UserRank[];
  minLevel?: number;
  createdAt: Date;
  updatedAt: Date;
  buttonUrl?: string;
  buttonText?: string;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  menuContent?: string;
  startAt: Date;
  endAt: Date;
  type: NoticeType;
  excludedRanks: UserRank[];
  minLevel?: number;
  buttonUrl?: string;
  buttonText?: string;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> {
  isActive?: boolean;
}