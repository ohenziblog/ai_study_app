import type { Category } from '../models/Category';
import type { Skill } from '../models/Skill';

const { AppDataSource: categoryDataSource } = require('../config/DataSource');
const { Category: CategoryEntity } = require('../models/Category');
const { Skill: SkillEntity } = require('../models/Skill');
const categoryServiceLogger = require('../utils/logger').default;

// リポジトリの取得
const categoryRepository = categoryDataSource.getRepository(CategoryEntity);
const skillRepository = categoryDataSource.getRepository(SkillEntity);

/**
 * 安全なカテゴリー情報を返す
 * @param category カテゴリーエンティティ
 * @returns 整形されたカテゴリー情報
 */
const formatCategory = (category: Category) => {
  return {
    id: category.category_id,
    name: category.category_name,
    description: category.description,
    parent_id: category.parent_id,
    level: category.level
  };
};

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
 * カテゴリー（教科）に関する操作を提供するサービス
 * データベースアクセスとビジネスロジックを担当
 */
const categoryService = {
  /**
   * すべてのカテゴリーを取得
   */
  findAll: async () => {
    try {
      const categories = await categoryRepository.find({
        order: { category_name: 'ASC' }
      });
      // Categoryパラメータに型を追加
      return categories.map((category: Category) => formatCategory(category));
    } catch (error) {
      categoryServiceLogger.error(`カテゴリー一覧取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのカテゴリーを取得
   */
  findById: async (id: number) => {
    try {
      return await categoryRepository.findOneBy({ category_id: id });
    } catch (error) {
      categoryServiceLogger.error(`ID: ${id} のカテゴリー取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定された名前のカテゴリーを取得
   */
  findByName: async (name: string) => {
    try {
      return await categoryRepository.findOneBy({ category_name: name });
    } catch (error) {
      categoryServiceLogger.error(`名前: "${name}" のカテゴリー取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 特定のカテゴリーに属するスキル一覧を取得
   */
  findSkillsByCategory: async (categoryId: number) => {
    try {
      const skills = await skillRepository.find({
        where: { category_id: categoryId },
        order: { skill_name: 'ASC' }
      });
      // Skillパラメータに型を追加
      return skills.map((skill: Skill) => formatSkill(skill));
    } catch (error) {
      categoryServiceLogger.error(`カテゴリーID: ${categoryId} のスキル取得中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 新しいカテゴリーを作成
   */
  create: async (categoryData: Partial<Category>) => {
    try {
      // 親カテゴリーが指定されている場合はレベルを設定
      if (categoryData.parent_id) {
        const parentCategory = await categoryRepository.findOneBy({ 
          category_id: categoryData.parent_id 
        });
        
        if (parentCategory) {
          categoryData.level = parentCategory.level + 1;
          
          // 将来的にltreeパスを設定する場合はここで実装
          // categoryData.path = parentCategory.path ? `${parentCategory.path}.${categoryData.parent_id}` : `${categoryData.parent_id}`;
        }
      } else {
        categoryData.level = 0;
        // categoryData.path = '';
      }

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);
      
      return formatCategory(savedCategory);
    } catch (error) {
      categoryServiceLogger.error(`カテゴリー作成中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのカテゴリーを更新
   */
  update: async (id: number, categoryData: Partial<Category>) => {
    try {
      const category = await categoryRepository.findOneBy({ category_id: id });
      if (!category) return null;
      
      // 更新可能なフィールドの反映
      if (categoryData.category_name !== undefined) category.category_name = categoryData.category_name;
      if (categoryData.description !== undefined) category.description = categoryData.description;
      
      // 親カテゴリーの変更は階層構造に影響するため慎重に処理
      if (categoryData.parent_id !== undefined && categoryData.parent_id !== category.parent_id) {
        // 循環参照チェック（自分自身や子孫を親にはできない）
        if (categoryData.parent_id === id) {
          throw new Error('カテゴリーを自分自身の子にすることはできません');
        }
        
        category.parent_id = categoryData.parent_id;
        
        // 親カテゴリーがある場合はレベルを更新
        if (categoryData.parent_id) {
          const parentCategory = await categoryRepository.findOneBy({ 
            category_id: categoryData.parent_id 
          });
          
          if (parentCategory) {
            category.level = parentCategory.level + 1;
            // 将来的にltreeパスを更新する場合はここで実装
          }
        } else {
          category.level = 0;
          // category.path = '';
        }
      }
      
      const savedCategory = await categoryRepository.save(category);
      return formatCategory(savedCategory);
    } catch (error) {
      categoryServiceLogger.error(`ID: ${id} のカテゴリー更新中にエラーが発生しました: ${error}`);
      throw error;
    }
  },

  /**
   * 指定されたIDのカテゴリーを削除
   */
  delete: async (id: number) => {
    try {
      const category = await categoryRepository.findOneBy({ category_id: id });
      if (!category) return false;
      
      await categoryRepository.remove(category);
      return true;
    } catch (error) {
      categoryServiceLogger.error(`ID: ${id} のカテゴリー削除中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

module.exports = categoryService;
