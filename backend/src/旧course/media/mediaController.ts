// backend/src/courses/media/mediaController.ts
import { Request, Response } from 'express';
import { mediaService } from './mediaService';

export const mediaController = {
  async getUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { filename, contentType } = req.body;
      
      if (!filename || !contentType) {
        res.status(400).json({ 
          error: 'Missing required fields' 
        });
        return;
      }

      const uploadData = await mediaService.getUploadUrl(
        filename,
        contentType
      );
      res.json(uploadData);
    } catch (error) {
      console.error('Upload URL generation error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },

  async getVideoStatus(req: Request, res: Response): Promise<void> {
    try {
      const { videoId } = req.params;
      const response = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
          headers: {
            'AccessKey': process.env.BUNNY_API_KEY!,
          }
        }
      );

      if (!response.ok) {
        res.status(500).json({ error: 'Failed to get video status' });
        return;
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: 'Failed to check video status' });
    }
  }
};