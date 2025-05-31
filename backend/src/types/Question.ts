// shared-typesから型定義をインポート
import { QuestionEntity, AnswerAPI, QuestionAPI } from '@ai-study-app/shared-types';
export * from '@ai-study-app/shared-types';

// 既存のコードとの互換性のために型を再エクスポート
export type {
  QuestionEntity,
  AnswerAPI,
  QuestionAPI
} from '@ai-study-app/shared-types';

// 既存のコードで使用されている型のエイリアス
export type Question = QuestionEntity.Question;
export type QuestionWithChoices = QuestionEntity.QuestionWithChoices;
export type QuestionHistory = QuestionEntity.QuestionHistory;
export type QuestionHistoryResponse = QuestionEntity.QuestionHistoryResponse;
export type AnswerRequest = AnswerAPI.AnswerRequest;
export type AnswerResponse = AnswerAPI.AnswerResponse;
export type GenerateQuestionRequest = QuestionAPI.GenerateQuestionRequest;
