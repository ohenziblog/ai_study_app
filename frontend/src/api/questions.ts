import apiClient from './axios';
import type { 
  AnswerRequest, 
  AnswerResponse, 
  MultipleChoiceAnswerRequest,
  MultipleChoiceAnswerResponse,
  ApiResponse,
  QuestionWithChoices 
} from '@ai-study-app/shared-types';
import logger from '../utils/logger';

/**
 * 問題関連のAPI
 */
export const questionApi = {
  /**
   * 新しい問題を取得する
   */
  getQuestion: async (categoryId?: number, skillId?: number): Promise<QuestionWithChoices> => {
    let url = '/questions';
    const params: Record<string, string> = {};
    
    if (categoryId) params.categoryId = categoryId.toString();
    if (skillId) params.skillId = skillId.toString();
    
    logger.debug(`問題取得リクエスト - カテゴリID: ${categoryId || '未指定'}, スキルID: ${skillId || '未指定'}`);
    const response = await apiClient.get<ApiResponse<QuestionWithChoices>>(url, { params });
    
    if (response.data.success && response.data.data) {
      logger.info('問題取得成功');
      return response.data.data;
    }
    
    const errorMessage = response.data.message || '問題取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 問題への回答を送信する（自由回答）
   */
  submitAnswer: async (data: AnswerRequest): Promise<AnswerResponse> => {
    logger.debug(`回答送信 - 問題ID: ${data.questionId}`);
    const response = await apiClient.post<ApiResponse<AnswerResponse>>('/answers', data);
    
    if (response.data.success && response.data.data) {
      const isCorrect = response.data.data.question.isCorrect;
      logger.info(`回答送信成功 - 結果: ${isCorrect ? '正解' : '不正解'}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || '回答送信に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },

  /**
   * 選択肢付き問題への回答を送信する
   */
  submitMultipleChoiceAnswer: async (data: MultipleChoiceAnswerRequest): Promise<MultipleChoiceAnswerResponse> => {
    logger.debug(`選択肢回答送信 - 問題ID: ${data.questionId}, 選択肢: ${data.selectedOptionIndex}`);
    const response = await apiClient.post<ApiResponse<MultipleChoiceAnswerResponse>>(
      '/answers/multiple-choice', 
      data
    );
    
    if (response.data.success && response.data.data) {
      const isCorrect = response.data.data.question.isCorrect;
      logger.info(`選択肢回答送信成功 - 結果: ${isCorrect ? '正解' : '不正解'}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || '回答送信に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * 問題履歴を取得する
   */
  getQuestionHistory: async (limit: number = 10): Promise<any[]> => {
    logger.debug(`問題履歴取得リクエスト - 件数: ${limit}`);
    const response = await apiClient.get<ApiResponse<any[]>>('/questions/history', {
      params: { limit }
    });
    
    if (response.data.success && response.data.data) {
      logger.info(`問題履歴取得成功 - ${response.data.data.length}件取得`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || '履歴取得に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};
