import { Request, Response } from 'express';
import { AvatarService } from './avatarService';

const avatarService = new AvatarService();

export class AvatarController {
  async generateAvatar(req: Request, res: Response) {
    try {
      const { mode, prompt, modelId, styleUUID } = req.body;

      let generationPrompt = prompt;
      if (mode === 'quick') {
        generationPrompt = "professional avatar portrait, highly detailed face, professional photography, 8k, high quality";
      }

      const response = await avatarService.generateAvatar({
        prompt: generationPrompt,
        modelId: modelId || "6b645e3a-d64f-4341-a6d8-7a3690fbf042", // Phoenix model
        styleUUID: styleUUID,
        num_images: 1,
        width: 512,
        height: 512
      });

      res.json(response);
    } catch (error) {
      console.error('Avatar generation failed:', error);
      res.status(500).json({ error: 'Failed to generate avatar' });
    }
  }

  // getGenerationStatusエンドポイントは不要なので削除
}