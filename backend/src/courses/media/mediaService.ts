// backend/src/courses/media/mediaService.ts
import { bunnyConfig } from '../../config/bunny';
import { BunnyVideoResponse, CreateVideoResponse, UploadUrlResponse } from './mediaTypes';

export const mediaService = {
  async getUploadUrl(
    filename: string, 
    contentType: string,
    courseId: string,
    chapterId: string
  ): Promise<UploadUrlResponse> {
    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${bunnyConfig.libraryId}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': bunnyConfig.apiKey!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `${courseId}_${chapterId}_${filename}`,
            collectionId: courseId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get upload URL from Bunny.net');
      }

      const data = await response.json() as CreateVideoResponse;

      return {
        id: data.guid,
        uploadUrl: data.httpUploadUrl,
      };
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      throw error;
    }
  }
};