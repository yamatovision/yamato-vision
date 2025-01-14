// backend/src/courses/media/mediaTypes.ts

// Muxアセット関連の型定義
export interface MuxAsset {
  id: string;
  playback_id: string;
  created_at: string;
  status: string;
  duration: number;
  max_stored_resolution?: string;
  max_stored_frame_rate?: number;
  aspect_ratio?: string;
  resolution_tier?: string;
  title: string;
  is_audio: boolean;
}

// Mux APIレスポンスの型定義
export interface MuxApiResponse {
  data: {
    id: string;
    playback_ids?: Array<{ id: string }>;
    created_at: string;
    status: string;
    duration: number;
    is_audio?: boolean;
    metadata?: {
      title?: string
    }
    max_stored_frame_rate?: number;
    max_stored_resolution?: string;
    aspect_ratio?: string;
    resolution_tier?: string;
  }[];
}

// レスポンス型の定義
export interface FormattedMuxResponse {
  data: MuxAsset[];
}

// アップロードレスポンスの型定義
export interface UploadResponse {
  id: string;
  playbackId: string;
  url: string;
}

// Mux API レスポンスの型定義
export interface MuxUploadResponse {
  data: {
    url: string;
  };
}

export interface MuxAssetResponse {
  data: {
    id: string;
    playback_ids?: Array<{ id: string }>;
    status: string;
  };
}