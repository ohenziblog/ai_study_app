import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';
import { HTTP_STATUS, createApiResponse } from '../utils/apiResponse';

const skillService = require('../services/skillService');
const categoryService = require('../services/categoryService');
const logger = require('../utils/logger').default;

/**
 * スキルコントローラー
 * HTTP リクエスト/レスポンス処理とエラーハンドリングを担当
 */
const skillController = {
  /**
   * すべてのスキルを取得
   * @route GET /skills
   */
  getAllSkills: async (req: Request, res: Response) => {
    try {
      const skills = await skillService.findAll();
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキル一覧を取得しました', skills)
      );
    } catch (error) {
      logger.error(`スキル一覧取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 特定のカテゴリーに属するスキルを取得
   * @route GET /skills/category/:categoryId
   */
  getSkillsByCategory: async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
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

      const skills = await skillService.findByCategory(categoryId);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキル一覧を取得しました', skills)
      );
    } catch (error) {
      logger.error(`カテゴリー別スキル取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 特定のスキルを取得
   * @route GET /skills/:id
   */
  getSkillById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '無効なIDです')
        );
      }

      const skill = await skillService.findById(id);
      if (!skill) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'スキルが見つかりません')
        );
      }

      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキルを取得しました', skill)
      );
    } catch (error) {
      logger.error(`スキル取得中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * 新しいスキルを作成（管理者用）
   * @route POST /skills
   */
  createSkill: async (req: AuthRequest, res: Response) => {
    try {
      // 管理者権限チェック
      if (!req.user || req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createApiResponse(false, 'この操作には管理者権限が必要です')
        );
      }

      const { skill_name, description, category_id, difficultyBase } = req.body;
      
      // 基本バリデーション
      if (!skill_name || !category_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, 'スキル名とカテゴリーIDは必須です')
        );
      }

      // カテゴリーの存在確認
      const category = await categoryService.findById(parseInt(category_id));
      if (!category) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createApiResponse(false, '指定されたカテゴリーが存在しません')
        );
      }

      // 同じカテゴリー内での重複スキル名チェック
      const existingSkill = await skillService.findByNameAndCategory(skill_name, parseInt(category_id));
      if (existingSkill) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, '同じカテゴリー内に同名のスキルが既に存在します')
        );
      }

      const skillData = {
        skill_name,
        description,
        category_id: parseInt(category_id),
        difficultyBase: difficultyBase ? parseFloat(difficultyBase) : 2.0
      };

      const newSkill = await skillService.create(skillData);
      logger.info(`新しいスキルが作成されました: ${skill_name} (カテゴリーID: ${category_id})`);
      
      return res.status(HTTP_STATUS.CREATED).json(
        createApiResponse(true, 'スキルが作成されました', newSkill)
      );
    } catch (error) {
      logger.error(`スキル作成中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * スキルを更新（管理者用）
   * @route PUT /skills/:id
   */
  updateSkill: async (req: AuthRequest, res: Response) => {
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

      // スキルの存在確認
      const skill = await skillService.findById(id);
      if (!skill) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'スキルが見つかりません')
        );
      }

      // カテゴリーが変更される場合は存在確認
      if (req.body.category_id && req.body.category_id !== skill.category?.categoryId) {
        const category = await categoryService.findById(parseInt(req.body.category_id));
        if (!category) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createApiResponse(false, '指定されたカテゴリーが存在しません')
          );
        }
      }

      // 同じカテゴリー内での重複スキル名チェック
      if (req.body.skill_name && req.body.skill_name !== skill.skillName) {
        const categoryId = req.body.category_id ? parseInt(req.body.category_id) : skill.category?.categoryId;
        const existingSkill = await skillService.findByNameAndCategory(req.body.skill_name, categoryId);
        
        if (existingSkill && existingSkill.skillId !== id) {
          return res.status(HTTP_STATUS.CONFLICT).json(
            createApiResponse(false, '同じカテゴリー内に同名のスキルが既に存在します')
          );
        }
      }

      const updatedSkill = await skillService.update(id, req.body);
      logger.info(`スキルが更新されました: ID=${id}`);
      
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキルが更新されました', updatedSkill)
      );
    } catch (error) {
      logger.error(`スキル更新中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  },

  /**
   * スキルを削除（管理者用）
   * @route DELETE /skills/:id
   */
  deleteSkill: async (req: AuthRequest, res: Response) => {
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

      // 関連するUserSkillLevelの存在チェック
      const hasRelatedData = await skillService.hasRelatedUserSkillLevels(id);
      if (hasRelatedData) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          createApiResponse(false, 'このスキルには学習記録が関連付けられているため削除できません')
        );
      }

      const result = await skillService.delete(id);
      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createApiResponse(false, 'スキルが見つかりません')
        );
      }

      logger.info(`スキルが削除されました: ID=${id}`);
      return res.status(HTTP_STATUS.OK).json(
        createApiResponse(true, 'スキルが削除されました')
      );
    } catch (error) {
      logger.error(`スキル削除中にエラーが発生しました: ${error}`);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json(
        createApiResponse(false, 'サーバーエラーが発生しました')
      );
    }
  }
};

module.exports = skillController;
