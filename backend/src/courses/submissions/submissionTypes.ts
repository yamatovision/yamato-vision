// backend/src/courses/submissions/submissionTypes.ts

import { Submission as PrismaSubmission } from '@prisma/client';
import { SubmissionVisibilityState } from '../chapters/chapterTypes';

// 基本的な提出データの拡張型
export interface SubmissionWithDetails extends PrismaSubmission {
  task: {
    title: string;
    maxPoints: number;
    timeLimit?: number;
  };
  chapter: {
    title: string;
    releaseTime?: number;
  };
}

// 提出作成用DTO
export interface CreateSubmissionDTO {
  taskId: string;
  userId: string;
  submission: string;
}

// 提出表示制御
export interface SubmissionDisplayControl {
  isTimeoutPhase: boolean;
  isOwnSubmission: boolean;
  hasMinimumScore: boolean;
  visibility: SubmissionVisibilityState;
}

// 提出結果
export interface SubmissionResult {
  submission: {
    id: string;
    content: string;
    points: number;
    feedback: string;
    nextStep: string | null;
  };
  visibility: SubmissionVisibilityState;
  finalScore: number;
  originalScore: number;
  feedback: string;
}

// データベース用提出型
export interface DbSubmission {
  id: string;
  userId: string;
  content: string;
  points: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
  evaluatedAt: Date;
  taskId: string;
}

// 提出統計情報
export interface SubmissionStats {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  timelySubmissions: number;
  lateSubmissions: number;
}

// ユーザーの提出状態
export interface UserSubmissionStatus {
  completed: boolean;
  submittedAt?: Date;
  score?: number;
  isLate: boolean;
  feedback?: string;
}

// ピア提出レスポンス
export interface PeerSubmissionResponse {
  id: string;
  content: string;
  points: number | null;  // null when hidden
  feedback: string | null;  // null when hidden
  submittedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rank: string;
    isCurrentUser: boolean;
  };
  visibility: SubmissionVisibilityState;
}

// ピア提出一覧レスポンス
export interface GetPeerSubmissionsResponse {
  submissions: PeerSubmissionResponse[];
  total: number;
  page: number;
  perPage: number;
  timeoutStatus: {
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
}

// 提出管理オプション
export interface SubmissionManagerOptions {
  userId: string;
  chapterId: string;
  taskId: string;
  content: string;
  currentTime: Date;
}