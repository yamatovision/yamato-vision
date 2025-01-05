// frontend/src/types/submission.ts
export interface PeerSubmission {
  id: string;
  content: string;
  points: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rank: string;
  };
}

export interface PeerSubmissionsResponse {
  submissions: PeerSubmission[];
  total: number;
  page: number;
  perPage: number;
}