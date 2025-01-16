// frontend/src/types/notice.ts
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

export type UserRank = keyof typeof USER_RANKS;
export type NoticeType = typeof NOTICE_TYPES[keyof typeof NOTICE_TYPES];

export interface Notice {
  id: string;
  title: string;
  content: string;
  startAt: string;  // Date型からstring型に変更
  endAt: string;    // Date型からstring型に変更
  type: NoticeType;
  isActive: boolean;
  excludedRanks: UserRank[];
  minLevel?: number;
  createdAt: string;  // Date型からstring型に変更
  updatedAt: string;  // Date型からstring型に変更
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  startAt: string;   // Date型からstring型に変更
  endAt: string;     // Date型からstring型に変更
  type: NoticeType;
  excludedRanks: UserRank[];
  minLevel?: number;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> {
  isActive?: boolean;
}

export const NOTICE_TYPE_CONFIG = {
  [NOTICE_TYPES.INFO]: {
    label: 'お知らせ',
    borderColor: 'border-blue-500',
  },
  [NOTICE_TYPES.MAINTENANCE]: {
    label: 'メンテナンス',
    borderColor: 'border-yellow-500',
  },
  [NOTICE_TYPES.SUCCESS]: {
    label: '完了',
    borderColor: 'border-green-500',
  },
} as const;