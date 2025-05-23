import type { User } from '../types/User';

const { AppDataSource } = require('../config/DataSource');
const { User: UserEntity } = require('../models/User');
const logger = require('../utils/logger').default;

// Userエンティティのリポジトリを取得
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * ユーザーに関連する操作を提供するサービス
 * データベースアクセスとビジネスロジックを担当
 */
const userService = {
  /**
   * すべてのユーザーを取得
   */
  findAll: async (): Promise<User[]> => {
    try {
      return await userRepository.find();
    } catch (error) {
      logger.error(`ユーザー一覧取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのユーザーを取得
   */
  findById: async (id: number): Promise<User | null> => {
    try {
      return await userRepository.findOneBy({ userId: id });
    } catch (error) {
      logger.error(`ID: ${id} のユーザー取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたメールアドレスのユーザーを取得
   */
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      return await userRepository.findOneBy({ email });
    } catch (error) {
      logger.error(`メールアドレス: ${email} のユーザー取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 新しいユーザーを作成
   */
  create: async (userData: Partial<User>): Promise<User> => {
    try {
      const user = userRepository.create(userData);
      return await userRepository.save(user);
    } catch (error) {
      logger.error(`ユーザー作成中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのユーザーを更新
   */
  update: async (id: number, userData: Partial<User>): Promise<User | null> => {
    try {
      const user = await userRepository.findOneBy({ userId: id });
      if (!user) return null;
      
      // ユーザーデータを更新
      Object.assign(user, userData);
      return await userRepository.save(user);
    } catch (error) {
      logger.error(`ID: ${id} のユーザー更新中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのユーザーを削除
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const user = await userRepository.findOneBy({ userId: id });
      if (!user) return false;
      
      await userRepository.remove(user);
      return true;
    } catch (error) {
      logger.error(`ID: ${id} のユーザー削除中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

module.exports = userService;
