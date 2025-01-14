// backend/src/courses/media/mediaService.ts

import { 
  FormattedMuxResponse, 
  MuxAsset, 
  MuxApiResponse, 
  UploadResponse,
  MuxUploadResponse,
  MuxAssetResponse 
} from './mediaTypes';

export const mediaService = {
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
          max_stored_frame_rate: asset.max_stored_frame_rate || 0,
          aspect_ratio: asset.aspect_ratio || '',
          resolution_tier: asset.resolution_tier || '',
          title: asset.metadata?.title || 'Untitled',
          is_audio: Boolean(asset.is_audio)
        }))
      };
    } catch (error) {
      console.error('Error fetching Mux assets:', error);
      throw error;
    }
  },

  async createAsset(file: File, isAudio: boolean = false): Promise<UploadResponse> {
    try {
      if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        throw new Error('Missing Mux credentials');
      }

      const createResponse = await fetch('https://api.mux.com/video/v1/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [{
            type: isAudio ? 'audio' : 'video',
          }],
          playback_policy: ['public'],
          mp4_support: 'standard',
          normalize_audio: true
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create Mux asset');
      }

      const assetData = await createResponse.json() as MuxAssetResponse;

      const uploadResponse = await fetch(`https://api.mux.com/video/v1/assets/${assetData.data.id}/upload-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const uploadData = await uploadResponse.json() as MuxUploadResponse;

      return {
        id: assetData.data.id,
        playbackId: assetData.data.playback_ids?.[0]?.id || '',
        url: uploadData.data.url
      };
    } catch (error) {
      console.error('Error creating Mux asset:', error);
      throw error;
    }
  },

  async getAssetStatus(assetId: string): Promise<string> {
    try {
      if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        throw new Error('Missing Mux credentials');
      }

      const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch asset status');
      }

      const assetData = await response.json() as MuxAssetResponse;
      return assetData.data.status;
    } catch (error) {
      console.error('Error getting asset status:', error);
      throw error;
    }
  }
};