export interface Course {
  id: string;
  title: string;
  stage: string;
  level: string;
  progress: number;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'other';
  url: string;
}
