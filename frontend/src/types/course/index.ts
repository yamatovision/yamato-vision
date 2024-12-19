export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'other';
  url: string;
}
