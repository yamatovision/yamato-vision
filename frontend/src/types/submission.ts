export interface SubmissionState {
  hasSubmitted: boolean;
  bestScore?: number;
  peerSubmissions: PeerSubmission[];
  timeoutStatus: {  // オプショナルを削除
    isTimedOut: boolean;
    timeOutAt?: Date;
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
    avatarUrl: string | null;
    rank: string;
    isCurrentUser: boolean;
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