import type { Response, NextFunction } from '../types';
import type { AuthRequest } from '../types';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';

const { User } = require('../models/User');
const { AppDataSource } = require('../config/DataSource');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger').default;

/**
 /**
 * JWT認証を検証するミドルウェア
 */
const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // ヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse(false, '認証トークンが必要です')
      );
    }

    // トークンを検証
    const token = authHeader.split(' ')[1];
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse(false, '無効または期限切れのトークンです')
      );
    }

    // ユーザーをデータベースから取得（userId フィールドを使用）
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ userId: decoded.userId });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createApiResponse(false, 'ユーザーが見つかりません')
      );
    }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = user;

    next();
  } catch (error) {
    // 本番環境ではエラー詳細を隠す
    if (process.env.NODE_ENV === 'production') {
      logger.error('認証処理中にエラーが発生しました');
    } else {
      logger.error(`認証処理中にエラーが発生しました: ${error}`);
    }
    
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
      createApiResponse(false, 'サーバーエラーが発生しました')
    );
  }
};

module.exports = authMiddleware;
