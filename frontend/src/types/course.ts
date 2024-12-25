export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore: number;
  excellentScore: number;
  isPublished: boolean;
  isArchived: boolean;
  publishedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  stage?: string;
  level?: string;
  progress?: number;
}

export interface ChapterContent {
  type: 'video' | 'audio';
  url: string;
  transcription?: string;
}

export interface Task {
  id?: string;  // Optional for creation
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
  type: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible: boolean;
  isFinalExam: boolean;
  task: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore: number;
  excellentScore: number;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  thumbnail?: string;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore?: number;
  excellentScore?: number;
  isPublished?: boolean;
  isArchived?: boolean;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible?: boolean;
  isFinalExam?: boolean;
  task: Omit<Task, 'id'>;
}

export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  orderIndex?: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible?: boolean;
  isFinalExam?: boolean;
  task?: Omit<Task, 'id'>;
}

export interface CourseResponse {
  data: Course[];
}

export interface SingleCourseResponse {
  data: Course;
}

export interface ChapterResponse {
  data: Chapter;
}
