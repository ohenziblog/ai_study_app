import apiClient from './axios';
import type { Question, AnswerRequest, AnswerResponse, ApiResponse } from '../types/api';

/**
 * 問題関連のAPI
 */
export const questionApi = {
  /**
   * 新しい問題を取得する
   */
  getQuestion: async (categoryId?: number, skillId?: number): Promise<Question> => {
    let url = '/questions';
    const params: Record<string, string> = {};
    
    if (categoryId) params.category_id = categoryId.toString();
    if (skillId) params.skill_id = skillId.toString();
    
    const response = await apiClient.get<ApiResponse<Question>>(url, { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '問題取得に失敗しました');
  },
  
  /**
   * 問題への回答を送信する
   */
  submitAnswer: async (data: AnswerRequest): Promise<AnswerResponse> => {
    const response = await apiClient.post<ApiResponse<AnswerResponse>>('/answers', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '回答送信に失敗しました');
  },
  
  /**
   * 問題履歴を取得する
   */
  getQuestionHistory: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/questions/history', {
      params: { limit }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '履歴取得に失敗しました');
  }
};
