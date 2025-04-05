import apiClient from './axios';
import type { Category, Skill, ApiResponse } from '../types/api';

/**
 * カテゴリー（教科）関連のAPI
 */
export const categoryApi = {
  /**
   * すべてのカテゴリー（教科）を取得
   */
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'カテゴリー取得に失敗しました');
  },
  
  /**
   * 特定のカテゴリー（教科）を取得
   */
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'カテゴリー取得に失敗しました');
  },
  
  /**
   * 特定のカテゴリーに属するスキル一覧を取得
   */
  getCategorySkills: async (id: number): Promise<{ category: Category; skills: Skill[] }> => {
    const response = await apiClient.get<ApiResponse<{ category: Category; skills: Skill[] }>>(`/categories/${id}/skills`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'スキル一覧取得に失敗しました');
  }
};
