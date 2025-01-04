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
  taskId: string;
  userId: string;
  submission: string;
}


export interface SubmissionResult {
  submission: {
    id: string;
    content: string;
    points?: number;
    feedback?: string;
  };
  finalScore?: number;
  originalScore?: number;
  feedback?: string;
}
export interface UserSubmissionStatus {
  completed: boolean;
  submittedAt?: Date;
  score?: number;
  feedback?: string;
  isLate: boolean;
}
export interface DbSubmission {
  id: string;
  userId: string;
  content: string;
  points: number | null;
  feedback: string | null;
  submittedAt: Date;
  evaluatedAt: Date | null;
  taskId: string;
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
