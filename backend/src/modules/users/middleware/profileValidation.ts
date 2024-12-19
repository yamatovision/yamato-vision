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
    const { twitter, line, tiktok } = data.snsLinks;
    
    // URLの基本的な形式チェック
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (twitter && !urlPattern.test(twitter)) {
      return res.status(400).json({ error: 'Invalid Twitter URL format' });
    }
    if (line && !urlPattern.test(line)) {
      return res.status(400).json({ error: 'Invalid LINE URL format' });
    }
    if (tiktok && !urlPattern.test(tiktok)) {
      return res.status(400).json({ error: 'Invalid TikTok URL format' });
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

  // boolean値のチェック
  if (data.isRankingVisible !== undefined && typeof data.isRankingVisible !== 'boolean') {
    return res.status(400).json({ error: 'Invalid ranking visibility setting' });
  }

  if (data.isProfileVisible !== undefined && typeof data.isProfileVisible !== 'boolean') {
    return res.status(400).json({ error: 'Invalid profile visibility setting' });
  }

  next();
};
