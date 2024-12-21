import { Request, Response, NextFunction } from 'express';

// リクエストロガー
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
};

// エラーロガー
export const errorLogger = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  console.error(`${new Date().toISOString()} [ERROR] ${err.stack}`);
  next(err);
};

// createLogger関数を追加
export const createLogger = (service: string) => {
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${service}] INFO:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${service}] ERROR:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${service}] WARN:`, message, ...args);
    }
  };
};
