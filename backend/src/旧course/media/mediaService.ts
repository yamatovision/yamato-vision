// backend/src/courses/media/mediaService.ts
import { bunnyConfig } from '../../config/bunny';
import { BunnyVideoResponse, CreateVideoResponse, UploadUrlResponse } from './mediaTypes';

interface BunnyResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  status: number;
}

export const mediaService = {
  async getUploadUrl(
    filename: string, 
    contentType: string
  ): Promise<UploadUrlResponse> {
    try {
      console.log('Requesting upload URL with:', {
        libraryId: bunnyConfig.libraryId,
        filename,
        contentType
      });

      const response = await fetch(
        `https://video.bunnycdn.com/library/${bunnyConfig.libraryId}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': bunnyConfig.apiKey || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: filename
          })
        }
      );

      console.log('Bunny.net response status:', response.status);
      const data = await response.json() as BunnyResponse;
      console.log('Bunny.net response data:', data);

      if (!response.ok) {
        throw new Error(`Failed to create video entry: ${JSON.stringify(data)}`);
      }

      // アップロードURLとCDN URLの構築
      const uploadUrl = `https://video.bunnycdn.com/library/${bunnyConfig.libraryId}/videos/${data.guid}`;
      const cdnUrl = `${bunnyConfig.cdnUrl}/${data.guid}`;

      return {
        id: data.guid,
        uploadUrl,
        cdnUrl
      };
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      throw error;
    }
  }
};