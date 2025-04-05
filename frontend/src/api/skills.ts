import apiClient from './axios';
import type { Skill, ApiResponse } from '../types/api';

/**
 * スキル関連のAPI
 */
export const skillApi = {
  /**
   * すべてのスキルを取得
   */
  getAllSkills: async (): Promise<Skill[]> => {
    const response = await apiClient.get<ApiResponse<Skill[]>>('/skills');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'スキル取得に失敗しました');
  },
  
  /**
   * 特定のカテゴリーに属するスキルを取得
   */
  getSkillsByCategory: async (categoryId: number): Promise<Skill[]> => {
    const response = await apiClient.get<ApiResponse<Skill[]>>(`/skills/category/${categoryId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'スキル取得に失敗しました');
  },
  
  /**
   * 特定のスキルを取得
   */
  getSkillById: async (id: number): Promise<Skill> => {
    const response = await apiClient.get<ApiResponse<Skill>>(`/skills/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'スキル取得に失敗しました');
  }
};
