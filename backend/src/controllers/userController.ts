// 型定義のインポート
import type { Request, Response } from 'express';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';

const userService = require('../services/userService');
const logger = require('../utils/logger').default;

/**
 * ユーザーコントローラー
 * HTTP リクエスト/レスポンス処理とエラーハンドリングを担当
 */
const userController = {
  /**
   * すべてのユーザーを取得
   */
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await userService.findAll();
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'ユーザー一覧を取得しました', users)
      );
    } catch (error) {
      logger.error(`ユーザー一覧取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 指定されたIDのユーザーを取得
   */
  getUserById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      const user = await userService.findById(id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'ユーザーが見つかりません')
        );
      }

      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'ユーザーを取得しました', user)
      );
    } catch (error) {
      logger.error(`ユーザー取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 新しいユーザーを作成
   */
  createUser: async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      // 基本的なバリデーション
      if (!username || !email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, 'ユーザー名、メールアドレス、パスワードは必須です')
        );
      }

      // 既存のユーザーをチェック
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, 'このメールアドレスは既に使用されています')
        );
      }

      // 新しいユーザーを作成
      const userData = {
        username,
        email,
        passwordHash: password, // 本番環境では必ずハッシュ化すること
        firstName,
        lastName,
        role: 'student',
        isActive: true
      };

      const newUser = await userService.create(userData);
      logger.info(`ユーザーが作成されました: ${username} (${email})`);
      return res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(true, 'ユーザーが作成されました', newUser)
      );
    } catch (error) {
      logger.error(`ユーザー作成中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 指定されたIDのユーザーを更新
   */
  updateUser: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      const user = await userService.findById(id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'ユーザーが見つかりません')
        );
      }

      // ユーザーを更新
      const updatedUser = await userService.update(id, req.body);
      logger.info(`ユーザーID: ${id} が更新されました`);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'ユーザーが更新されました', updatedUser)
      );
    } catch (error) {
      logger.error(`ユーザー更新中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 指定されたIDのユーザーを削除
   */
  deleteUser: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      const success = await userService.delete(id);
      if (!success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'ユーザーが見つかりません')
        );
      }

      logger.info(`ユーザーID: ${id} が削除されました`);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'ユーザーが正常に削除されました')
      );
    } catch (error) {
      logger.error(`ユーザー削除中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = userController;
