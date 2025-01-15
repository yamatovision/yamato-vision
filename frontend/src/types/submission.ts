export interface SubmissionState {
  hasSubmitted: boolean;
  bestScore?: number;
  peerSubmissions: PeerSubmission[];
  timeoutStatus: {  // オプショナルを削除
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
}

export interface SubmissionResponse {
  success: boolean;
  data?: {
    submission: {
      id: string;
      points: number;
      feedback: string;
      nextStep?: string;  // 必須フィールドとして定義
    };
  };
}


// これを追加
export interface PeerSubmissionsResponse {
  submissions: PeerSubmission[];
  total: number;
  page: number;
  perPage: number;
  timeoutStatus: {
    isTimedOut: boolean;
    timeOutAt?: Date | null;
  };
}

// types/submission.ts
export interface PeerSubmission {
  id: string;
  content: string;
  points: number | null;
  feedback: string | null;
  submittedAt: string | Date; // string型も許容するように修正
  user: {
    id: string;
    name: string;
    nickname?: string;  // nicknameを追加
    avatarUrl: string | null;
    rank: string;
    isCurrentUser: boolean;
  };
}
export interface SubmissionResult {
  submission: {
    points: number;
    feedback: string;
    nextStep?: string;  // optional
  };
}
export interface SubmissionResult {
  score: number;
  feedback: string;
  nextStep: string;
}

export interface PeerSubmissionsProps {
  submissions: PeerSubmission[];
  timeoutStatus?: {  // オプショナルに変更
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
  onRefresh?: () => void;
}

export interface PeerSubmissionsResponse {
  submissions: PeerSubmission[];
  total: number;
  page: number;
  perPage: number;
}