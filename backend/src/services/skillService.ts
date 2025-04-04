import type { Skill } from '../models/Skill';

const { AppDataSource: skillDataSource } = require('../config/DataSource');
const { Skill: SkillEntity } = require('../models/Skill');
const { UserSkillLevel } = require('../models/UserSkillLevel');
const skillServiceLogger = require('../utils/logger').default;

// リポジトリの取得
const skillRepository = skillDataSource.getRepository(SkillEntity);
const userSkillLevelRepository = skillDataSource.getRepository(UserSkillLevel);

/**
 * 安全なスキル情報を返す
 * @param skill スキルエンティティ
 * @returns 整形されたスキル情報
 */
const formatSkill = (skill: Skill) => {
  return {
    id: skill.skill_id,
    name: skill.skill_name,
    description: skill.description,
    category_id: skill.category_id,
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
        order: { skill_name: 'ASC' },
        relations: ['category']
      });

      // ここでスキルパラメータに明示的な型を追加
      return skills.map((skill: Skill) => ({
        ...formatSkill(skill),
        category: skill.category ? {
          id: skill.category.category_id,
          name: skill.category.category_name
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
        where: { skill_id: id },
        relations: ['category']
      });

      if (!skill) return null;

      return {
        ...formatSkill(skill),
        category: skill.category ? {
          id: skill.category.category_id,
          name: skill.category.category_name
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
        where: { category_id: categoryId },
        order: { skill_name: 'ASC' }
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
          skill_name: name,
          category_id: categoryId
        }
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
        where: { skill_id: skillId }
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
  create: async (skillData: Partial<Skill>) => {
    try {
      // 難易度の範囲を0.5-4.5に制限
      if (skillData.difficultyBase !== undefined) {
        skillData.difficultyBase = Math.max(0.5, Math.min(4.5, skillData.difficultyBase));
      } else {
        skillData.difficultyBase = 2.0; // デフォルト難易度
      }

      const skill = skillRepository.create(skillData);
      const savedSkill = await skillRepository.save(skill);
      
      // カテゴリー情報を含めて返す
      const fullSkill = await skillRepository.findOne({
        where: { skill_id: savedSkill.skill_id },
        relations: ['category']
      });
      
      return {
        ...formatSkill(fullSkill),
        category: fullSkill.category ? {
          id: fullSkill.category.category_id,
          name: fullSkill.category.category_name
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
  update: async (id: number, skillData: Partial<Skill>) => {
    try {
      const skill = await skillRepository.findOneBy({ skill_id: id });
      if (!skill) return null;
      
      // 更新可能なフィールドの反映
      if (skillData.skill_name !== undefined) skill.skill_name = skillData.skill_name;
      if (skillData.description !== undefined) skill.description = skillData.description;
      if (skillData.category_id !== undefined) skill.category_id = skillData.category_id;
      
      // 難易度の範囲を0.5-4.5に制限
      if (skillData.difficultyBase !== undefined) {
        skill.difficultyBase = Math.max(0.5, Math.min(4.5, skillData.difficultyBase));
      }
      
      const savedSkill = await skillRepository.save(skill);
      
      // カテゴリー情報を含めて返す
      const fullSkill = await skillRepository.findOne({
        where: { skill_id: savedSkill.skill_id },
        relations: ['category']
      });
      
      return {
        ...formatSkill(fullSkill),
        category: fullSkill.category ? {
          id: fullSkill.category.category_id,
          name: fullSkill.category.category_name
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
      const skill = await skillRepository.findOneBy({ skill_id: id });
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
