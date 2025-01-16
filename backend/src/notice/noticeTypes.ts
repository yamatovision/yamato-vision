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
} as const;



// 必要に応じて簡単に追加可能
// IMPORTANT: 'important',
// EVENT: 'event',
// UPDATE: 'update',

export type UserRank = keyof typeof USER_RANKS;
export type NoticeType = typeof NOTICE_TYPES[keyof typeof NOTICE_TYPES];

// UI表示用の設定
export const NOTICE_TYPE_CONFIG = {
  [NOTICE_TYPES.INFO]: {
    label: 'お知らせ',
    borderColor: 'border-blue-500',
    icon: 'info'
  },
  [NOTICE_TYPES.MAINTENANCE]: {
    label: 'メンテナンス',
    borderColor: 'border-yellow-500',
    icon: 'maintenance'
  },
  [NOTICE_TYPES.SUCCESS]: {
    label: '完了',
    borderColor: 'border-green-500',
    icon: 'success'
  },
} as const;

export interface Notice {
  id: string;
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  type: NoticeType;
  isActive: boolean;
  excludedRanks: UserRank[];
  minLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  type: NoticeType;
  excludedRanks: UserRank[];
  minLevel?: number;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> {
  isActive?: boolean;
}