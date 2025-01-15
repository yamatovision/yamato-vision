export interface ExamSectionResponse {
  sectionId: string;
  score: number;
  feedback: string;
  nextStep?: string;  // オプショナルに修正
  submittedAt: string;
  isComplete: boolean;
}