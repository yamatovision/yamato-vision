// backend/src/courses/media/mediaService.ts
import {  CreateVideoResponse, UploadUrlResponse } from './mediaTypes';

interface MuxAsset {
  id: string;               // Asset ID
  playback_id: string;      // Playback ID（単一の値として）
  created_at: string;
  status: string;
  duration: number;
  max_stored_resolution: string;
  max_stored_frame_rate: number;
  aspect_ratio: string;
  resolution_tier: string;
  title: string;
}
interface MuxApiResponse {
  data: {
    id: string;
    playback_ids?: Array<{ id: string }>;
    created_at: string;
    status: string;
    duration: number;
    max_stored_frame_rate: number;
    max_stored_resolution: string;  // 追加
    aspect_ratio: string;          // 追加
    resolution_tier: string;       // 追加
    metadata?: {
      title?: string
    }
  }[];
}



interface FormattedMuxResponse {
  data: MuxAsset[];
}

export const mediaService = {


  // mediaService.ts に追加
async updateAssetTitle(assetId: string, title: string): Promise<void> {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('Missing Mux credentials');
    }

    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          title: title
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update asset title');
    }
  } catch (error) {
    console.error('Error updating asset title:', error);
    throw error;
  }
},
  async listMuxAssets(): Promise<FormattedMuxResponse> {
    try {
      if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        throw new Error('Missing Mux credentials');
      }

      const response = await fetch('https://api.mux.com/video/v1/assets', {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Mux assets');
      }

      const responseData = await response.json() as MuxApiResponse;

      return {
        data: responseData.data.map(asset => ({
          id: asset.id,
          playback_id: asset.playback_ids?.[0]?.id || '',
          created_at: asset.created_at,
          status: asset.status,
          duration: asset.duration,
          max_stored_resolution: asset.max_stored_resolution || '',
          max_stored_frame_rate: asset.max_stored_frame_rate,
          aspect_ratio: asset.aspect_ratio || '',
          resolution_tier: asset.resolution_tier || '',
          title: asset.metadata?.title || 'Untitled' // タイトルのマッピングを追加
        }))
      };
    } catch (error) {
      console.error('Error fetching Mux assets:', error);
      throw error;
    }
  }
};

