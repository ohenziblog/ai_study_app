import apiClient from './axios';
import type { Category, Skill, ApiResponse } from '../types/api';
import logger from '../utils/logger';

/**
 * カテゴリー（教科）関連のAPI
 */
export const categoryApi = {
  /**
   * すべてのカテゴリー（教科）を取得
   */
  getAllCategories: async (): Promise<Category[]> => {
    logger.debug('すべてのカテゴリー取得リクエスト');
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    
    if (response.data.success && response.data.data) {
      logger.info(`カテゴリー取得成功 - ${response.data.data.length}件取得`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'カテゴリー取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 特定のカテゴリー（教科）を取得
   */
  getCategoryById: async (id: number): Promise<Category> => {
    logger.debug(`カテゴリー取得リクエスト - ID: ${id}`);
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    
    if (response.data.success && response.data.data) {
      logger.info(`カテゴリー取得成功 - ID: ${id}, 名前: ${response.data.data.categoryName}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'カテゴリー取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 特定のカテゴリーに属するスキル一覧を取得
   */
  getCategorySkills: async (id: number): Promise<{ category: Category; skills: Skill[] }> => {
    logger.debug(`カテゴリースキル一覧取得リクエスト - カテゴリーID: ${id}`);
    const response = await apiClient.get<ApiResponse<{ category: Category; skills: Skill[] }>>(`/categories/${id}/skills`);
    
    if (response.data.success && response.data.data) {
      logger.info(`カテゴリースキル一覧取得成功 - カテゴリー: ${response.data.data.category.categoryName}, スキル数: ${response.data.data.skills.length}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'スキル一覧取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};
