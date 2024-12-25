import { Submission as PrismaSubmission } from '@prisma/client';

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

export interface CreateSubmissionDTO {
  content: string;
  userId: string;
  taskId: string;
}

export interface SubmissionResult {
  submission: PrismaSubmission;
  timePenalty?: boolean;
  finalScore: number;
  originalScore: number;
  feedback: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  timelySubmissions: number;
  lateSubmissions: number;
}

// ユーザーごとの提出状況
export interface UserSubmissionStatus {
  completed: boolean;
  submittedAt?: Date;
  score?: number;
  isLate: boolean;
  feedback?: string;
}
