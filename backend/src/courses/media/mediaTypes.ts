// backend/src/courses/media/mediaTypes.ts
export interface BunnyVideoResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: any[];
  hasMP4Fallback: boolean;
  collectionId: string | null;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string | null;
  chapters: any[];
  moments: any[];
  metaTags: any[];
  metadata: {
    clip_id: string;
    video_id: string;
    upload_timestamp: string;
  };
}

export interface CreateVideoResponse extends BunnyVideoResponse {
  httpUploadUrl: string;
}

export interface UploadUrlResponse {
  id: string;
  uploadUrl: string;
  cdnUrl: string;  // CDN URLを追加
}

// データベースとの連携のための型
export interface MediaProgress {
  id: string;
  userId: string;
  chapterId: string;
  position: number;
  deviceId?: string;
  updatedAt: Date;
  createdAt: Date;
}

// Content type in Chapter model
export interface ChapterContent {
  type: 'video' | 'audio';
  url: string;
  transcription?: string;
  bunnyVideoId?: string; // Bunny.netのGUID保存用
}