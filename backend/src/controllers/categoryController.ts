import type { Request, Response } from 'express';
import type { AuthRequest } from '../types';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';

const categoryService = require('../services/categoryService');
const logger = require('../utils/logger').default;

/**
 * カテゴリー（教科）コントローラー
 * HTTP リクエスト/レスポンス処理とエラーハンドリングを担当
 */
const categoryController = {
  /**
   * すべてのカテゴリー（教科）を取得
   * @route GET /categories
   */
  getAllCategories: async (req: Request, res: Response) => {
    try {
      const categories = await categoryService.findAll();
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'カテゴリー一覧を取得しました', categories)
      );
    } catch (error) {
      logger.error(`カテゴリー一覧取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 特定のカテゴリー（教科）を取得
   * @route GET /categories/:id
   */
  getCategoryById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      const category = await categoryService.findById(id);
      if (!category) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'カテゴリーが見つかりません')
        );
      }

      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'カテゴリーを取得しました', category)
      );
    } catch (error) {
      logger.error(`カテゴリー取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 特定のカテゴリーに属するスキル一覧を取得
   * @route GET /categories/:id/skills
   */
  getCategorySkills: async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なカテゴリーIDです')
        );
      }

      // カテゴリーの存在確認
      const category = await categoryService.findById(categoryId);
      if (!category) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'カテゴリーが見つかりません')
        );
      }

      const skills = await categoryService.findSkillsByCategory(categoryId);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキル一覧を取得しました', {
          category: {
            id: category.category_id,
            name: category.category_name,
            description: category.description
          },
          skills
        })
      );
    } catch (error) {
      logger.error(`カテゴリー関連スキル取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 新しいカテゴリーを作成（管理者用）
   * @route POST /categories
   */
  createCategory: async (req: AuthRequest, res: Response) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createApiResponse(false, 'この操作には管理者権限が必要です')
        );
      }

      const { category_name, description, parent_id } = req.body;
      
      // 基本バリデーション
      if (!category_name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, 'カテゴリー名は必須です')
        );
      }

      // カテゴリー名の重複チェック
      const existingCategory = await categoryService.findByName(category_name);
      if (existingCategory) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, '同名のカテゴリーが既に存在します')
        );
      }

      const categoryData = {
        category_name,
        description,
        parent_id: parent_id ? parseInt(parent_id) : null
      };

      const newCategory = await categoryService.create(categoryData);
      logger.info(`新しいカテゴリーが作成されました: ${category_name}`);
      
      return res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(true, 'カテゴリーが作成されました', newCategory)
      );
    } catch (error) {
      logger.error(`カテゴリー作成中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * カテゴリーを更新（管理者用）
   * @route PUT /categories/:id
   */
  updateCategory: async (req: AuthRequest, res: Response) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createApiResponse(false, 'この操作には管理者権限が必要です')
        );
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      // カテゴリーの存在確認
      const categoryExists = await categoryService.findById(id);
      if (!categoryExists) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'カテゴリーが見つかりません')
        );
      }

      // カテゴリー名が変更される場合は重複チェック
      if (req.body.category_name && req.body.category_name !== categoryExists.category_name) {
        const existingCategory = await categoryService.findByName(req.body.category_name);
        if (existingCategory && existingCategory.category_id !== id) {
          return res.status(HTTP_STATUS.CONFLICT).json(
            createApiResponse(false, '同名のカテゴリーが既に存在します')
          );
        }
      }

      const updatedCategory = await categoryService.update(id, req.body);
      logger.info(`カテゴリーが更新されました: ID=${id}`);
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'カテゴリーが更新されました', updatedCategory)
      );
    } catch (error) {
      logger.error(`カテゴリー更新中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * カテゴリーを削除（管理者用）
   * @route DELETE /categories/:id
   */
  deleteCategory: async (req: AuthRequest, res: Response) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createApiResponse(false, 'この操作には管理者権限が必要です')
        );
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      // 関連スキルの存在チェック
      const relatedSkills = await categoryService.findSkillsByCategory(id);
      if (relatedSkills.length > 0) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, 'このカテゴリーに関連するスキルが存在するため削除できません')
        );
      }

      const result = await categoryService.delete(id);
      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'カテゴリーが見つかりません')
        );
      }

      logger.info(`カテゴリーが削除されました: ID=${id}`);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'カテゴリーが削除されました')
      );
    } catch (error) {
      logger.error(`カテゴリー削除中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = categoryController;
