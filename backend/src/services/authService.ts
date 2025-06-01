import type { User, SafeUser, RegisterDTO } from '../types';

const { AppDataSource } = require('../config/DataSource');
const { User: UserEntity } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger').default;

// ユーザーリポジトリの取得
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * パスワードハッシュを除いた安全なユーザーオブジェクトを生成する
 * @param user ユーザーエンティティ
 * @returns パスワード情報を除いたユーザーオブジェクト
 */
const createSafeUser = (user: any): SafeUser => {
  // 型安全性を保つために明示的にプロパティをマップ
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    settings: user.settings
  } as SafeUser;
};

/**
 * 認証関連の操作を提供するサービス
 */
const authService = {
  /**
   * ユーザー登録
   * @param userData 登録するユーザーデータ
   * @returns 登録されたユーザー（安全な形式）とトークン
   */
  register: async (userData: RegisterDTO): Promise<{ user: SafeUser; token: string }> => {
    try {
      // メールアドレスの重複チェック
      const existingUserByEmail = await userRepository.findOneBy({ email: userData.email });
      if (existingUserByEmail) {
        throw new Error('このメールアドレスは既に使用されています');
      }

      // ユーザー名の重複チェック
      const existingUserByUsername = await userRepository.findOneBy({ username: userData.username });
      if (existingUserByUsername) {
        throw new Error('このユーザー名は既に使用されています');
      }

      // パスワードのハッシュ化
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      // ユーザーの作成
      const newUser = userRepository.create({
        username: userData.username,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: 'student',
        isActive: true,
        settings: {}
      });

      const savedUser = await userRepository.save(newUser);
      logger.info(`新規ユーザーが登録されました: ${savedUser.email}`);

      // JWTトークンの生成
      const token = jwtUtils.generateToken({
        userId: savedUser.userId,
        role: savedUser.role
      });

      // 安全なユーザー情報を返す
      return {
        user: createSafeUser(savedUser),
        token
      };
    } catch (error: any) {
      // エラーログ記録（開発環境ではエラー詳細を表示、本番環境では抑制）
      if (process.env.NODE_ENV === 'production') {
        logger.error(`ユーザー登録処理でエラーが発生しました`);
      } else {
        logger.error(`ユーザー登録中にエラーが発生しました: ${error}`);
      }

      // データベースの一意性制約違反エラーを適切なエラーメッセージに変換
      if (error.code === '23505') {
        // PostgreSQLの一意性制約違反のエラーコード
        if (error.detail?.includes('(username)')) {
          throw new Error('このユーザー名は既に使用されています');
        } else if (error.detail?.includes('(email)')) {
          throw new Error('このメールアドレスは既に使用されています');
        }
      }
      
      throw error;
    }
  },

  /**
   * ユーザーログイン
   * @param email ユーザーのメールアドレス
   * @param password ユーザーのパスワード
   * @returns ユーザー情報（安全な形式）とトークン
   */
  login: async (email: string, password: string): Promise<{ user: SafeUser; token: string }> => {
    try {
      // ユーザーを検索
      const user = await userRepository.findOneBy({ email });
      if (!user) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }

      // パスワードの検証
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }

      // 最終ログイン日時を更新
      user.lastLoginAt = new Date();
      await userRepository.save(user);

      // JWTトークンの生成
      const token = jwtUtils.generateToken({
        userId: user.userId,
        role: user.role
      });

      logger.info(`ユーザーがログインしました: ${user.email}`);

      // 安全なユーザー情報を返す
      return {
        user: createSafeUser(user),
        token
      };
    } catch (error) {
      // エラーログ記録（開発環境ではエラー詳細を表示、本番環境では抑制）
      if (process.env.NODE_ENV === 'production') {
        logger.error(`ログイン処理でエラーが発生しました`);
      } else {
        logger.error(`ログイン中にエラーが発生しました: ${error}`);
      }
      throw error;
    }
  }
};

module.exports = authService;
