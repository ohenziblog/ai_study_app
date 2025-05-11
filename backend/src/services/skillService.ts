import type { Skill } from '../models/Skill';

const { AppDataSource: skillDataSource } = require('../config/DataSource');
const { Skill: SkillEntity } = require('../models/Skill');
const { Category } = require('../models/Category');
const { UserSkillLevel } = require('../models/UserSkillLevel');
const skillServiceLogger = require('../utils/logger').default;

// リポジトリの取得
const skillRepository = skillDataSource.getRepository(SkillEntity);
const categoryRepository = skillDataSource.getRepository(Category);
const userSkillLevelRepository = skillDataSource.getRepository(UserSkillLevel);

/**
 * 安全なスキル情報を返す
 * @param skill スキルエンティティ
 * @returns 整形されたスキル情報
 */
const formatSkill = (skill: Skill) => {
  return {
    id: skill.skillId,
    name: skill.skillName,
    description: skill.description,
    categoryId: skill.categoryId,
    difficulty: skill.difficultyBase
  };
};

/**
 * スキルに関する操作を提供するサービス
 * データベースアクセスとビジネスロジックを担当
 */
const skillService = {
  /**
   * すべてのスキルを取得
   */
  findAll: async () => {
    try {
      const skills = await skillRepository.find({
        order: { skillName: 'ASC' },
        relations: ['category']
      });

      // ここでスキルパラメータに明示的な型を追加
      return skills.map((skill: Skill) => ({
        ...formatSkill(skill),
        category: skill.category ? {
          id: skill.category.categoryId,
          name: skill.category.categoryName
        } : null
      }));
    } catch (error) {
      skillServiceLogger.error(`スキル一覧取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのスキルを取得
   */
  findById: async (id: number) => {
    try {
      const skill = await skillRepository.findOne({
        where: { skillId: id },
        relations: ['category']
      });

      if (!skill) return null;

      return {
        ...formatSkill(skill),
        category: skill.category ? {
          id: skill.category.categoryId,
          name: skill.category.categoryName
        } : null
      };
    } catch (error) {
      skillServiceLogger.error(`ID: ${id} のスキル取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたカテゴリーに属するスキルを取得
   */
  findByCategory: async (categoryId: number) => {
    try {
      const skills = await skillRepository.find({
        where: { category: { categoryId: categoryId } },
        order: { skillName: 'ASC' },
        relations: ['category']
      });
      
      return skills.map(formatSkill);
    } catch (error) {
      skillServiceLogger.error(`カテゴリーID: ${categoryId} のスキル一覧取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定された名前とカテゴリーIDのスキルを取得
   */
  findByNameAndCategory: async (name: string, categoryId: number) => {
    try {
      return await skillRepository.findOne({
        where: { 
          skillName: name,
          category: { categoryId: categoryId }
        },
        relations: ['category']
      });
    } catch (error) {
      skillServiceLogger.error(`名前: "${name}", カテゴリーID: ${categoryId} のスキル取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * スキルに関連するUserSkillLevelレコードが存在するか確認
   */
  hasRelatedUserSkillLevels: async (skillId: number) => {
    try {
      const count = await userSkillLevelRepository.count({
        where: { skill: { skillId: skillId } }
      });
      return count > 0;
    } catch (error) {
      skillServiceLogger.error(`スキルID: ${skillId} の関連データ確認中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 新しいスキルを作成
   */
  create: async (skillData: Partial<any>) => {
    try {
      // 難易度の範囲を0.5-4.5に制限
      if (skillData.difficultyBase !== undefined) {
        skillData.difficultyBase = Math.max(0.5, Math.min(4.5, skillData.difficultyBase));
      } else {
        skillData.difficultyBase = 2.0; // デフォルト難易度
      }

      // カテゴリーの取得
      let category = null;
      if (skillData.categoryId) { 
        category = await categoryRepository.findOneBy({ categoryId: skillData.categoryId });
        if (!category) {
          throw new Error(`カテゴリID ${skillData.categoryId} が見つかりません`);
        }
      }

      // 新しいスキルデータの作成
      const newSkillData: any = {
        skillName: skillData.skillName,
        description: skillData.description,
        difficultyBase: skillData.difficultyBase,
        category: category
      };

      const skill = skillRepository.create(newSkillData);
      const savedSkill = await skillRepository.save(skill);
      
      // カテゴリー情報を含めて返す
      const fullSkill = await skillRepository.findOne({
        where: { skillId: savedSkill.skillId },
        relations: ['category']
      });
      
      return {
        ...formatSkill(fullSkill),
        category: fullSkill.category ? {
          id: fullSkill.category.categoryId,
          name: fullSkill.category.categoryName
        } : null
      };
    } catch (error) {
      skillServiceLogger.error(`スキル作成中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのスキルを更新
   */
  update: async (id: number, skillData: Partial<any>) => {
    try {
      const skill = await skillRepository.findOne({
        where: { skillId: id },
        relations: ['category']
      });
      
      if (!skill) return null;
      
      // 更新可能なフィールドの反映
      if (skillData.skillName !== undefined) skill.skillName = skillData.skillName;
      if (skillData.description !== undefined) skill.description = skillData.description;
      
      // カテゴリーの更新
      if (skillData.categoryId !== undefined) {
        const category = await categoryRepository.findOneBy({ categoryId: skillData.categoryId });
        if (!category) {
          throw new Error(`カテゴリID ${skillData.categoryId} が見つかりません`);
        }
        skill.category = category;
      }
      
      // 難易度の範囲を0.5-4.5に制限
      if (skillData.difficultyBase !== undefined) {
        skill.difficultyBase = Math.max(0.5, Math.min(4.5, skillData.difficultyBase));
      }
      
      const savedSkill = await skillRepository.save(skill);
      
      // カテゴリー情報を含めて返す
      const fullSkill = await skillRepository.findOne({
        where: { skillId: savedSkill.skillId },
        relations: ['category']
      });
      
      return {
        ...formatSkill(fullSkill),
        category: fullSkill.category ? {
          id: fullSkill.category.categoryId,
          name: fullSkill.category.categoryName
        } : null
      };
    } catch (error) {
      skillServiceLogger.error(`ID: ${id} のスキル更新中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのスキルを削除
   */
  delete: async (id: number) => {
    try {
      const skill = await skillRepository.findOneBy({ skillId: id });
      if (!skill) return false;
      
      await skillRepository.remove(skill);
      return true;
    } catch (error) {
      skillServiceLogger.error(`ID: ${id} のスキル削除中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

module.exports = skillService;
