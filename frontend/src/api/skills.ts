import apiClient from './axios';
import type { Skill, ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * スキル関連のAPI
 */
export const skillApi = {
  /**
   * すべてのスキルを取得
   */
  getAllSkills: async (): Promise<Skill[]> => {
    logger.debug('すべてのスキル取得リクエスト');
    const response = await apiClient.get<ApiResponse<Skill[]>>('/skills');
    
    if (response.data.success && response.data.data) {
      logger.info(`スキル取得成功 - ${response.data.data.length}件取得`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'スキル取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 特定のカテゴリーに属するスキルを取得
   */
  getSkillsByCategory: async (categoryId: number): Promise<Skill[]> => {
    logger.debug(`カテゴリー別スキル取得リクエスト - カテゴリーID: ${categoryId}`);
    const response = await apiClient.get<ApiResponse<Skill[]>>(`/skills/category/${categoryId}`);
    
    if (response.data.success && response.data.data) {
      logger.info(`カテゴリー別スキル取得成功 - カテゴリーID: ${categoryId}, ${response.data.data.length}件取得`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'スキル取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 特定のスキルを取得
   */
  getSkillById: async (id: number): Promise<Skill> => {
    logger.debug(`スキル取得リクエスト - ID: ${id}`);
    const response = await apiClient.get<ApiResponse<Skill>>(`/skills/${id}`);
    
    if (response.data.success && response.data.data) {
      logger.info(`スキル取得成功 - ID: ${id}, 名前: ${response.data.data.name}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'スキル取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};
