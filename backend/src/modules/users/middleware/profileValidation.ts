import { Request, Response, NextFunction } from 'express';
import { ProfileUpdateData } from '../types/profile.types';

export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const data: ProfileUpdateData = req.body;

  // SNSリンクのバリデーション
  if (data.snsLinks) {
    // URLの基本的な形式チェック
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    for (const link of data.snsLinks) {
      if (!link.type || !['twitter', 'line', 'tiktok'].includes(link.type)) {
        return res.status(400).json({ error: 'Invalid SNS type' });
      }

      if (!link.value || !urlPattern.test(link.value)) {
        return res.status(400).json({ error: `Invalid ${link.type} URL format` });
      }
    }
  }

  // ニックネームの長さチェック
  if (data.nickname && (data.nickname.length < 1 || data.nickname.length > 30)) {
    return res.status(400).json({ 
      error: 'Nickname must be between 1 and 30 characters' 
    });
  }

  // メッセージの長さチェック
  if (data.message && data.message.length > 200) {
    return res.status(400).json({ 
      error: 'Message must not exceed 200 characters' 
    });
  }

  next();
};
