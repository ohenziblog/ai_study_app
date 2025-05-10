import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApi } from '../api/questions';
import type { 
  Question, 
  MultipleChoiceQuestion, 
  AnswerRequest, 
  MultipleChoiceAnswerRequest 
} from '../types/api';

// 問題を取得するためのフック
export const useQuestion = (categoryId?: number, skillId?: number) => {
  return useQuery<Question | MultipleChoiceQuestion, Error>({
    queryKey: ['question', { categoryId, skillId }],
    queryFn: () => questionApi.getQuestion(categoryId, skillId),
    staleTime: 0, // 常に新しい問題を取得
    cacheTime: 0, // キャッシュしない
    retry: false,
  });
};

// 問題履歴を取得するためのフック
export const useQuestionHistory = (limit: number = 10) => {
  return useQuery({
    queryKey: ['questionHistory', limit],
    queryFn: () => questionApi.getQuestionHistory(limit),
    staleTime: 60 * 1000, // 1分間キャッシュ
  });
};

// 自由回答を送信するためのフック
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AnswerRequest) => questionApi.submitAnswer(data),
    onSuccess: () => {
      // 履歴キャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['questionHistory'] });
    },
  });
};

// 選択肢回答を送信するためのフック
export const useSubmitMultipleChoiceAnswer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MultipleChoiceAnswerRequest) => 
      questionApi.submitMultipleChoiceAnswer(data),
    onSuccess: () => {
      // 履歴キャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['questionHistory'] });
    },
  });
};

// 4択問題かどうかを判定するユーティリティ関数
export const isMultipleChoiceQuestion = (
  question: Question | MultipleChoiceQuestion
): question is MultipleChoiceQuestion => {
  return 'options' in question && Array.isArray((question as MultipleChoiceQuestion).options);
};
