import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';
import type { AnswerRequest } from '../types/Question';

const answerService = require('../services/answerService');
const logger = require('../utils/logger').default;

/**
 * 回答コントローラー
 * 回答に関するリクエスト処理を担当
 */
const answerController = {
  /**
   * 選択肢付き問題への回答を記録する
   * @route POST /answers/multiple-choice
   */
  recordMultipleChoiceAnswer: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createApiResponse(false, '認証が必要です')
        );
      }
      // フロントエンドとの整合性のため両方のパラメータ名をサポート
      const { questionId, selectedOptionIndex , timeTaken } = req.body;
      
      // 基本的なバリデーション
      if (questionId === undefined || selectedOptionIndex === undefined) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '問題IDと選択肢のインデックスは必須です')
        );
      }

      const userId = req.user.userId;
      
      const result = await answerService.recordMultipleChoiceAnswer(
        questionId,
        userId,
        selectedOptionIndex,
        timeTaken || 0
      );
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, '回答が記録されました', result)
      );
    } catch (error: any) {
      logger.error(`選択式問題の回答記録中にエラーが発生しました: ${error.message}`);
      
      // クライアントエラーの処理
      if (error.message.includes('見つかりません') || 
          error.message.includes('既に回答済み') ||
          error.message.includes('選択式ではありません') ||
          error.message.includes('無効な選択肢')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, error.message)
        );
      }
      
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 問題への回答を記録する（従来の自由回答式）
   * @route POST /answers
   */
  recordAnswer: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createApiResponse(false, '認証が必要です')
        );
      }

      const { questionId, answerText, isCorrect, timeTaken } = req.body;
      
      // 基本的なバリデーション
      if (questionId === undefined || !answerText) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '問題IDと回答テキストは必須です')
        );
      }

      const userId = req.user.userId;
      
      const result = await answerService.recordAnswer(
        questionId,
        userId,
        answerText,
        isCorrect,
        timeTaken || 0
      );
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, '回答が記録されました', result)
      );
    } catch (error: any) {
      logger.error(`回答記録中にエラーが発生しました: ${error.message}`);
      
      // クライアントエラーの処理
      if (error.message.includes('見つかりません') || 
          error.message.includes('既に回答済み')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, error.message)
        );
      }
      
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = answerController;
