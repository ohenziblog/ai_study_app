import type { Request, Response } from '../types';
import type { RegisterDTO } from '../types';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';
import { validateRegisterRequest, validateLoginRequest, LoginRequestDTO } from '../validators/auth.validator';

const authService = require('../services/authService');
const logger = require('../utils/logger').default;

/**
 * 認証コントローラー
 * 認証関連のリクエスト処理を担当
 */
const authController = {
  /**
   * ユーザー登録
   * @route POST /auth/register
   */
  register: async (req: Request, res: Response) => {
    try {
      // リクエストの検証
      const validation = validateRegisterRequest(req.body);
      if (!validation.isValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '入力エラーがあります', undefined, validation.errors)
        );
      }
      
      // 登録処理用のDTOを作成
      const registerDto: RegisterDTO = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      };
      
      // ユーザー登録処理
      const result = await authService.register(registerDto);
      
      logger.info(`新規ユーザー登録が完了しました: ${registerDto.email}`);
      
      // 成功レスポンスを返す
      return res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(true, 'ユーザー登録が完了しました', result)
      );
    } catch (error: any) {
      // エラーログの記録
      logger.error(`ユーザー登録処理中にエラーが発生しました`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.error(error);
      }
      
      // エラー種別に応じたステータスコードとレスポンスの設定
      if (error.message.includes('既に使用されています')) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, error.message)
        );
      }
      
      // データベースエラーの詳細なハンドリング
      if (error.code === '23505') { // PostgreSQLの一意性制約違反のエラーコード
        let message = 'ユーザー情報が重複しています';
        
        if (error.detail?.includes('(username)')) {
          message = 'このユーザー名は既に使用されています';
        } else if (error.detail?.includes('(email)')) {
          message = 'このメールアドレスは既に使用されています';
        }
        
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, message)
        );
      }
      
      // その他のエラー
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },
  
  /**
   * ユーザーログイン
   * @route POST /auth/login
   */
  login: async (req: Request, res: Response) => {
    try {
      // リクエストの検証
      const validation = validateLoginRequest(req.body);
      if (!validation.isValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '入力エラーがあります', undefined, validation.errors)
        );
      }
      
      // ログイン用DTOを作成
      const loginDto: LoginRequestDTO = {
        email: req.body.email,
        password: req.body.password
      };
      
      // ログイン処理
      const result = await authService.login(loginDto.email, loginDto.password);
      
      logger.info(`ユーザーがログインしました: ${loginDto.email}`);
      
      // 成功レスポンスを返す
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'ログインに成功しました', result)
      );
    } catch (error: any) {
      // エラーログの記録
      logger.error(`ログイン処理中にエラーが発生しました`);
      
      if (process.env.NODE_ENV !== 'production') {
        logger.error(error);
      }
      
      // 認証エラー
      if (error.message.includes('正しくありません')) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createApiResponse(false, '認証に失敗しました')
        );
      }
      
      // その他のエラー
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = authController;
