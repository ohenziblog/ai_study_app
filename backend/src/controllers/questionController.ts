import type { Response } from 'express';
import type { AuthRequest } from '../types';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';

const questionService = require('../services/questionService');
const logger = require('../utils/logger').default;

/**
 * 問題コントローラー
 * 問題に関するリクエスト処理を担当
 */
const questionController = {
  /**
   * 新しい問題を取得する
   * @route GET /questions
   */
  getQuestion: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createApiResponse(false, '認証が必要です')
        );
      }

      const userId = req.user.userId;
      
      // より堅牢な実装 - NaNを明示的にチェック
      let categoryId = undefined;
      let skillId = undefined;
      
      if (req.query.categoryId) {
        const parsedCategoryId = parseInt(req.query.categoryId as string);
        // NaNの場合は明示的にundefinedのままにする
        if (!Number.isNaN(parsedCategoryId)) {
          categoryId = parsedCategoryId;
        }
      }
      
      if (req.query.skillId) {
        const parsedSkillId = parseInt(req.query.skillId as string);
        if (!Number.isNaN(parsedSkillId)) {
          skillId = parsedSkillId;
        }
      }
      
      const question = await questionService.generateQuestion(userId, categoryId, skillId);
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, '問題を取得しました', question)
      );
    } catch (error: any) {
      logger.error(`問題取得中にエラーが発生しました: ${error.message}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },
  
  /**
   * 問題履歴を取得する
   * @route GET /questions/history
   */
  getQuestionHistory: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createApiResponse(false, '認証が必要です')
        );
      }

      const userId = req.user.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const history = await questionService.getQuestionHistory(userId, limit);
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, '問題履歴を取得しました', history)
      );
    } catch (error: any) {
      logger.error(`問題履歴取得中にエラーが発生しました: ${error.message}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = questionController;
