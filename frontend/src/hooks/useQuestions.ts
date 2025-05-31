import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApi } from '../api/questions';
import type { 
  QuestionWithChoices,
  AnswerRequest, 
  MultipleChoiceAnswerRequest
} from '@ai-study-app/shared-types';
import logger from '../utils/logger';

// 問題を取得するためのフック
export const useQuestion = (categoryId?: number, skillId?: number) => {
  return useQuery<QuestionWithChoices, Error>({
    queryKey: ['question', { categoryId, skillId }],
    queryFn: async () => {
      logger.debug(`問題取得中 - カテゴリID: ${categoryId || '未指定'}, スキルID: ${skillId || '未指定'}`);
      try {
        const question = await questionApi.getQuestion(categoryId, skillId);
        logger.debug(`問題取得成功 - タイプ: ${isMultipleChoiceQuestion(question) ? '選択式' : '記述式'}`);
        return question;
      } catch (error) {
        logger.error('問題取得中にエラーが発生しました', { notify: false });
        throw error;
      }
    },
    staleTime: 0, // 常に新しい問題を取得
    gcTime: 0, // キャッシュしない
    retry: false,
  });
};

// 問題履歴を取得するためのフック
export const useQuestionHistory = (limit: number = 10) => {
  return useQuery({
    queryKey: ['questionHistory', limit],
    queryFn: async () => {
      logger.debug(`問題履歴取得中 - 件数上限: ${limit}`);
      try {
        const history = await questionApi.getQuestionHistory(limit);
        logger.debug(`問題履歴取得成功 - ${history.length}件取得`);
        return history;
      } catch (error) {
        logger.error('問題履歴取得中にエラーが発生しました', { notify: false });
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1分間キャッシュ
  });
};

// 自由回答を送信するためのフック
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AnswerRequest) => {
      logger.debug(`回答送信中 - 問題ID: ${data.questionId}`);
      try {
        const result = await questionApi.submitAnswer(data);
        logger.info(`回答送信成功 - 結果: ${result.question.isCorrect ? '正解' : '不正解'}`);
        return result;
      } catch (error) {
        logger.error('回答送信中にエラーが発生しました', { notify: false });
        throw error;
      }
    },
    onSuccess: () => {
      // 履歴キャッシュを無効化して再取得を促す
      logger.debug('問題履歴キャッシュを更新');
      queryClient.invalidateQueries({ queryKey: ['questionHistory'] });
    },
  });
};

// 選択肢回答を送信するためのフック
export const useSubmitMultipleChoiceAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MultipleChoiceAnswerRequest) => {
      logger.debug(`選択肢回答送信中 - 問題ID: ${data.questionId}, 選択肢: ${data.selectedOptionIndex}`);
      try {
        const result = await questionApi.submitMultipleChoiceAnswer(data);
        logger.info(`選択肢回答送信成功 - 結果: ${result.isCorrect ? '正解' : '不正解'}`);
        return result;
      } catch (error) {
        logger.error('選択肢回答送信中にエラーが発生しました', { notify: false });
        throw error;
      }
    },
    onSuccess: () => {
      // 履歴キャッシュを無効化して再取得を促す
      logger.debug('問題履歴キャッシュを更新');
      queryClient.invalidateQueries({ queryKey: ['questionHistory'] });
    },
  });
};

// 4択問題かどうかを判定するユーティリティ関数
export const isMultipleChoiceQuestion = (
  question: QuestionWithChoices
): boolean => {
  return question.options && Array.isArray(question.options) && question.options.length > 0;
};
